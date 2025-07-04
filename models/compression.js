const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

async function compressImages(inputFiles, outputFolderPath, level,jquality) {
  const results = [];

  for (const inputFile of inputFiles) {
    const fileName = path.basename(inputFile);
    const ext = path.extname(inputFile).toLowerCase();
    const outputFilePath = `${outputFolderPath}${fileName}`;

    console.log(
      `Starting processing file: ${inputFile} at ${new Date().toISOString()}`,
    );

    try {
      let compressImage;

      if (ext === ".jpg" || ext === ".jpeg") {
        compressImage = () => sharp(inputFile).jpeg({ quality: jquality });
      } else if (ext === ".webp") {
        compressImage = () =>
          sharp(inputFile).webp({ quality: jquality, lossless: false });
      } else if (ext === ".png") {
        compressImage = () => sharp(inputFile).png({ compressionLevel: level });
      } else {
        console.error(
          `Invalid format for input image "${inputFile}", only PNG, JPG/JPEG, or WEBP are supported. Skipping this file.`,
        );
        continue;
      }

      const data = await compressImage().toBuffer();
      await fs.writeFile(outputFilePath, data);

      console.log(
        `Output file successfully written: ${outputFilePath} at ${new Date().toISOString()}`,
      );
      results.push({ success: true, file: inputFile });
    } catch (err) {
      console.error("Error processing image:", err);
      console.error(
        `Failed to process file: ${inputFile} at ${new Date().toISOString()}`,
      );
      results.push({ success: false, file: inputFile, error: err });
    }
  }

  return results;
}

module.exports = { compressImages };
