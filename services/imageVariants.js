const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const PUBLIC_DIRECTORY = path.join(__dirname, "..", "public");
const VARIANT_VERSION = "v1";
const VARIANT_WIDTHS = Object.freeze([480, 960, 1600]);
const VARIANT_QUALITY = 78;
const MAX_INPUT_PIXELS = 268_402_689;
const PROCESSING_TIMEOUT_SECONDS = 30;

function createSerialTaskQueue() {
  let tail = Promise.resolve();

  return {
    enqueue(task) {
      if (typeof task !== "function") {
        throw new TypeError("Queued image work must be a function");
      }
      const result = tail.then(task, task);
      tail = result.catch(() => {});
      return result;
    },
    async drain() {
      await tail;
    },
  };
}

function assertSafeMediaPath(mediaPath) {
  if (typeof mediaPath !== "string" || mediaPath.includes("\0")) {
    throw new TypeError("Media path must be a non-empty string");
  }

  const normalized = mediaPath.replaceAll("\\", "/").replace(/^\/+/, "");
  const segments = normalized.split("/");

  if (
    normalized.length === 0 ||
    segments.some(
      (segment) => segment.length === 0 || segment === "." || segment === "..",
    ) ||
    segments.length < 2 ||
    segments[0] !== "plantspic"
  ) {
    throw new Error("Media path must stay within the plant media directory");
  }

  return segments.join("/");
}

function assertVariantWidth(width) {
  const parsedWidth = Number(width);
  if (!VARIANT_WIDTHS.includes(parsedWidth)) {
    throw new RangeError("Unsupported image variant width");
  }
  return parsedWidth;
}

function getVariantRelativePath(mediaPath, width) {
  const safeMediaPath = assertSafeMediaPath(mediaPath);
  const safeWidth = assertVariantWidth(width);
  return path.posix.join(
    "variants",
    VARIANT_VERSION,
    String(safeWidth),
    `${safeMediaPath}.webp`,
  );
}

function getVariantPublicPath(mediaPath, width) {
  return `/public/${getVariantRelativePath(mediaPath, width)}`;
}

function getVariantFilePath(
  mediaPath,
  width,
  publicDirectory = PUBLIC_DIRECTORY,
) {
  const publicRoot = path.resolve(publicDirectory);
  const destination = path.resolve(
    publicRoot,
    ...getVariantRelativePath(mediaPath, width).split("/"),
  );

  if (!destination.startsWith(`${publicRoot}${path.sep}`)) {
    throw new Error("Image variant path escaped the public directory");
  }

  return destination;
}

function getVariantFallbackFilePaths(
  mediaPath,
  publicDirectory = PUBLIC_DIRECTORY,
) {
  const safeMediaPath = assertSafeMediaPath(mediaPath);
  const publicRoot = path.resolve(publicDirectory);
  const pathSegments = safeMediaPath.split("/");
  return {
    compressed: path.resolve(publicRoot, "compressed", ...pathSegments),
    original: path.resolve(publicRoot, ...pathSegments),
  };
}

function parseVariantRequestPath(requestPath) {
  if (typeof requestPath !== "string" || requestPath.includes("\0")) {
    throw new TypeError("Variant request path must be a non-empty string");
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch (_) {
    throw new Error("Variant request path is not valid URL encoding");
  }
  const normalized = decodedPath.replaceAll("\\", "/").replace(/^\/+/, "");
  const segments = normalized.split("/");
  if (
    segments.length < 6 ||
    segments[0] !== "public" ||
    segments[1] !== "variants" ||
    segments[2] !== VARIANT_VERSION
  ) {
    throw new Error("Unsupported image variant request path");
  }

  const width = assertVariantWidth(segments[3]);
  const encodedMediaPath = segments.slice(4).join("/");
  if (!encodedMediaPath.endsWith(".webp")) {
    throw new Error("Image variant request must use the WebP suffix");
  }
  const mediaPath = assertSafeMediaPath(
    encodedMediaPath.slice(0, -".webp".length),
  );

  if (normalized !== `public/${getVariantRelativePath(mediaPath, width)}`) {
    throw new Error("Image variant request is not canonical");
  }

  return { mediaPath: `/${mediaPath}`, width };
}

function getMediaPathFromInput(inputFilePath, publicDirectory) {
  const publicRoot = path.resolve(publicDirectory);
  const absoluteInput = path.resolve(inputFilePath);
  const relativeInput = path.relative(publicRoot, absoluteInput);

  if (
    relativeInput.length === 0 ||
    relativeInput.startsWith("..") ||
    path.isAbsolute(relativeInput)
  ) {
    throw new Error("Input image must stay within the public directory");
  }

  return assertSafeMediaPath(relativeInput.split(path.sep).join("/"));
}

function createVariantPipeline(
  inputFilePath,
  width,
  quality = VARIANT_QUALITY,
) {
  return sharp(inputFilePath, {
    failOn: "error",
    limitInputPixels: MAX_INPUT_PIXELS,
  })
    .rotate()
    .resize({
      width: assertVariantWidth(width),
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, lossless: false })
    .timeout({ seconds: PROCESSING_TIMEOUT_SECONDS });
}

async function pathExists(filePath) {
  return fs
    .stat(filePath)
    .then(() => true)
    .catch((error) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    });
}

async function publishWithoutOverwrite(temporaryPath, destinationPath) {
  try {
    await fs.link(temporaryPath, destinationPath);
    return true;
  } catch (error) {
    if (error.code === "EEXIST") {
      return false;
    }
    throw error;
  } finally {
    await fs.unlink(temporaryPath).catch(() => {});
  }
}

async function generateImageVariants(
  inputFilePath,
  {
    publicDirectory = PUBLIC_DIRECTORY,
    widths = VARIANT_WIDTHS,
    quality = VARIANT_QUALITY,
  } = {},
) {
  const mediaPath = getMediaPathFromInput(inputFilePath, publicDirectory);
  const inputStat = await fs.lstat(inputFilePath);
  if (!inputStat.isFile() || inputStat.isSymbolicLink()) {
    throw new Error("Input image must be a regular file");
  }
  const safeWidths = [...new Set(widths.map(assertVariantWidth))].sort(
    (left, right) => left - right,
  );
  const results = [];

  for (const width of safeWidths) {
    const destinationPath = getVariantFilePath(
      mediaPath,
      width,
      publicDirectory,
    );

    if (await pathExists(destinationPath)) {
      results.push({ status: "existing", width });
      continue;
    }

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    const temporaryPath = `${destinationPath}.tmp-${crypto
      .randomBytes(8)
      .toString("hex")}.webp`;

    try {
      const information = await createVariantPipeline(
        inputFilePath,
        width,
        quality,
      ).toFile(temporaryPath);
      const published = await publishWithoutOverwrite(
        temporaryPath,
        destinationPath,
      );
      results.push({
        status: published ? "created" : "existing",
        width,
        ...(published
          ? {
              bytes: information.size,
              height: information.height,
              outputWidth: information.width,
            }
          : {}),
      });
    } catch (error) {
      await fs.unlink(temporaryPath).catch(() => {});
      results.push({
        status: "failed",
        width,
        errorCode: error.code || "IMAGE",
      });
    }
  }

  return results;
}

async function cleanupImageVariants(
  mediaPath,
  { publicDirectory = PUBLIC_DIRECTORY, widths = VARIANT_WIDTHS } = {},
) {
  const results = [];

  for (const width of [...new Set(widths.map(assertVariantWidth))]) {
    const variantPath = getVariantFilePath(mediaPath, width, publicDirectory);
    try {
      await fs.unlink(variantPath);
      results.push({ status: "removed", width });
    } catch (error) {
      if (error.code === "ENOENT") {
        results.push({ status: "missing", width });
      } else {
        results.push({ status: "failed", width, errorCode: error.code });
      }
    }
  }

  return results;
}

async function moveWithoutOverwrite(sourcePath, destinationPath) {
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

async function renameImageVariants(
  oldMediaPath,
  newMediaPath,
  { publicDirectory = PUBLIC_DIRECTORY, widths = VARIANT_WIDTHS } = {},
) {
  assertSafeMediaPath(oldMediaPath);
  assertSafeMediaPath(newMediaPath);
  const results = [];

  for (const width of [...new Set(widths.map(assertVariantWidth))]) {
    const sourcePath = getVariantFilePath(oldMediaPath, width, publicDirectory);
    const destinationPath = getVariantFilePath(
      newMediaPath,
      width,
      publicDirectory,
    );
    try {
      results.push({
        status: await moveWithoutOverwrite(sourcePath, destinationPath),
        width,
      });
    } catch (error) {
      results.push({ status: "failed", width, errorCode: error.code || "IO" });
    }
  }

  return results;
}

module.exports = {
  MAX_INPUT_PIXELS,
  PROCESSING_TIMEOUT_SECONDS,
  PUBLIC_DIRECTORY,
  VARIANT_QUALITY,
  VARIANT_VERSION,
  VARIANT_WIDTHS,
  assertSafeMediaPath,
  assertVariantWidth,
  cleanupImageVariants,
  createSerialTaskQueue,
  createVariantPipeline,
  generateImageVariants,
  getVariantFallbackFilePaths,
  getVariantFilePath,
  getVariantPublicPath,
  getVariantRelativePath,
  parseVariantRequestPath,
  renameImageVariants,
};
