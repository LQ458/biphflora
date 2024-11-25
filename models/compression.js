const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function compressImages(inputFiles, outputFolderPath) {
  inputFiles.forEach((inputFile) => {
    const fileName = path.basename(inputFile);
    const ext = path.extname(inputFile).toLowerCase();
    const outputFilePath = `${outputFolderPath}${fileName}`;
    console.log(
      `Starting processing file: ${inputFile} at ${new Date().toISOString()}`,
    );

    let compressImage;

    if (ext === ".jpg" || ext === ".jpeg") {
      compressImage = () => sharp(inputFile).jpeg({ quality: 60 }).toBuffer();
    } else if (ext === ".webp") {
      compressImage = () =>
        sharp(inputFile).webp({ quality: 60, lossless: false }).toBuffer();
    } else if (ext === ".png") {
      compressImage = () =>
        sharp(inputFile).png({ compressionLevel: 5 }).toBuffer();
    } else {
      console.error(
        `Invalid format for input image "${inputFile}", only PNG, JPG/JPEG, or WEBP are supported. Skipping this file.`,
      );
      return;
    }

    compressImage()
      .then((data) => {
        fs.writeFile(outputFilePath, data, (err) => {
          if (err) {
            console.error("Error writing output file:", err);
            return;
          }
          console.log(
            `Output file successfully written: ${outputFilePath} at ${new Date().toISOString()}`,
          );
        });
      })
      .catch((err) => {
        console.error("Error processing image:", err);
        console.error(
          `Failed to process file: ${inputFile} at ${new Date().toISOString()}`,
        );
      });
  });
}

module.exports = { compressImages };