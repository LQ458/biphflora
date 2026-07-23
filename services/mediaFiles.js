const fs = require("fs").promises;
const path = require("path");
const {
  cleanupImageVariants,
  renameImageVariants,
} = require("./imageVariants");

const PUBLIC_DIRECTORY = path.join(__dirname, "..", "public");
const PLANT_MEDIA_DIRECTORY = path.join(PUBLIC_DIRECTORY, "plantspic");
const COMPRESSED_PLANT_MEDIA_DIRECTORY = path.join(
  PUBLIC_DIRECTORY,
  "compressed",
  "plantspic",
);

function getUploadedFiles(files) {
  if (Array.isArray(files)) {
    return files;
  }

  return Object.values(files || {}).flat();
}

function getPlantMediaDirectory() {
  return `${PLANT_MEDIA_DIRECTORY}${path.sep}`;
}

function getCompressedPlantMediaDirectory() {
  return `${COMPRESSED_PLANT_MEDIA_DIRECTORY}${path.sep}`;
}

function getPlantMediaPath(filename) {
  return path.join(PLANT_MEDIA_DIRECTORY, filename);
}

function getCompressedPlantMediaPath(filename) {
  return path.join(COMPRESSED_PLANT_MEDIA_DIRECTORY, filename);
}

async function cleanupFiles(filePaths) {
  await Promise.all(
    filePaths.map((filePath) =>
      fs.unlink(filePath).catch((error) => {
        if (error.code !== "ENOENT") {
          console.warn("Unable to clean up uploaded file");
        }
      }),
    ),
  );
}

function assertSafeFilename(filename) {
  if (
    typeof filename !== "string" ||
    filename.length === 0 ||
    filename.includes("\0") ||
    path.basename(filename) !== filename
  ) {
    throw new Error("Media filename must not contain a directory path");
  }

  return filename;
}

async function moveFileWithoutOverwrite(sourcePath, destinationPath) {
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  try {
    await fs.link(sourcePath, destinationPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return "missing";
    }
    if (error.code === "EEXIST") {
      return "destination-exists";
    }
    throw error;
  }

  try {
    await fs.unlink(sourcePath);
    return "renamed";
  } catch (error) {
    await fs.unlink(destinationPath).catch(() => {});
    throw error;
  }
}

async function cleanupPlantMediaDerivatives(
  filename,
  { publicDirectory = PUBLIC_DIRECTORY } = {},
) {
  const safeFilename = assertSafeFilename(filename);
  const compressedPath = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
    safeFilename,
  );
  let compressedStatus = "removed";

  try {
    await fs.unlink(compressedPath);
  } catch (error) {
    compressedStatus = error.code === "ENOENT" ? "missing" : "failed";
  }

  return {
    compressed: compressedStatus,
    variants: await cleanupImageVariants(`/plantspic/${safeFilename}`, {
      publicDirectory,
    }),
  };
}

function assertDerivativeCleanupSucceeded(result) {
  const variantFailure = result?.variants?.some(
    (variant) => variant.status === "failed",
  );
  if (!result || result.compressed === "failed" || variantFailure) {
    throw new Error("Unable to remove one or more media derivatives");
  }
  return result;
}

async function renamePlantMediaDerivatives(
  oldFilename,
  newFilename,
  { publicDirectory = PUBLIC_DIRECTORY } = {},
) {
  const safeOldFilename = assertSafeFilename(oldFilename);
  const safeNewFilename = assertSafeFilename(newFilename);
  const oldCompressedPath = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
    safeOldFilename,
  );
  const newCompressedPath = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
    safeNewFilename,
  );

  return {
    compressed: await moveFileWithoutOverwrite(
      oldCompressedPath,
      newCompressedPath,
    ),
    variants: await renameImageVariants(
      `/plantspic/${safeOldFilename}`,
      `/plantspic/${safeNewFilename}`,
      { publicDirectory },
    ),
  };
}

module.exports = {
  assertDerivativeCleanupSucceeded,
  assertSafeFilename,
  cleanupFiles,
  cleanupPlantMediaDerivatives,
  getCompressedPlantMediaDirectory,
  getCompressedPlantMediaPath,
  getPlantMediaDirectory,
  getPlantMediaPath,
  getUploadedFiles,
  renamePlantMediaDerivatives,
};
