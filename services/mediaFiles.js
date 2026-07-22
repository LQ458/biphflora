const fs = require("fs").promises;
const path = require("path");

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

module.exports = {
  cleanupFiles,
  getCompressedPlantMediaDirectory,
  getCompressedPlantMediaPath,
  getPlantMediaDirectory,
  getPlantMediaPath,
  getUploadedFiles,
};
