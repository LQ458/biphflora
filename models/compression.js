const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

// Keep Sharp's documented default pixel ceiling explicit until production
// dimensions can be sampled in an isolated environment.
const MAX_INPUT_PIXELS = 268_402_689;
const PROCESSING_TIMEOUT_SECONDS = 30;

function createPipeline(inputFile, extension, pngCompressionLevel, quality) {
  const image = sharp(inputFile, {
    failOn: "error",
    limitInputPixels: MAX_INPUT_PIXELS,
  })
    .rotate()
    .timeout({ seconds: PROCESSING_TIMEOUT_SECONDS });

  if (extension === ".jpg" || extension === ".jpeg") {
    return image.jpeg({ quality });
  }
  if (extension === ".png") {
    return image.png({ compressionLevel: pngCompressionLevel });
  }
  if (extension === ".webp") {
    return image.webp({ quality, lossless: false });
  }

  return null;
}

async function compressImages(
  inputFiles,
  outputFolderPath,
  pngCompressionLevel,
  quality,
) {
  const results = [];
  await fs.mkdir(outputFolderPath, { recursive: true });

  for (const inputFile of inputFiles) {
    const fileName = path.basename(inputFile);
    const extension = path.extname(inputFile).toLowerCase();
    const outputFilePath = path.join(outputFolderPath, fileName);
    const temporaryOutputPath = `${outputFilePath}.tmp-${crypto
      .randomBytes(8)
      .toString("hex")}${extension}`;
    const pipeline = createPipeline(
      inputFile,
      extension,
      pngCompressionLevel,
      quality,
    );

    if (!pipeline) {
      results.push({ success: false, file: inputFile });
      continue;
    }

    try {
      await pipeline.toFile(temporaryOutputPath);
      await fs.rename(temporaryOutputPath, outputFilePath);
      results.push({ success: true, file: inputFile });
    } catch (_) {
      await fs.unlink(temporaryOutputPath).catch(() => {});
      results.push({ success: false, file: inputFile });
    }
  }

  return results;
}

module.exports = {
  MAX_INPUT_PIXELS,
  PROCESSING_TIMEOUT_SECONDS,
  compressImages,
  createPipeline,
};
