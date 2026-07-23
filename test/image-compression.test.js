const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const sharp = require("sharp");

const { compressImages } = require("../models/compression");

test("image processing preserves the requested format and writes atomically", async () => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-compression-"),
  );
  const inputDirectory = path.join(temporaryDirectory, "input");
  const outputDirectory = path.join(temporaryDirectory, "output");
  const inputFile = path.join(inputDirectory, "fixture.png");

  try {
    await fs.mkdir(inputDirectory);
    await sharp({
      create: {
        width: 12,
        height: 8,
        channels: 3,
        background: "#4f7f3f",
      },
    })
      .png()
      .toFile(inputFile);

    const results = await compressImages(
      [inputFile],
      outputDirectory,
      9,
      70,
    );
    const outputFile = path.join(outputDirectory, "fixture.png");
    const metadata = await sharp(outputFile).metadata();
    const outputFiles = await fs.readdir(outputDirectory);

    assert.deepEqual(results, [{ success: true, file: inputFile }]);
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, 12);
    assert.equal(metadata.height, 8);
    assert.deepEqual(outputFiles, ["fixture.png"]);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("failed processing leaves no partial derivative", async () => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-compression-failure-"),
  );
  const inputFile = path.join(temporaryDirectory, "invalid.png");
  const outputDirectory = path.join(temporaryDirectory, "output");

  try {
    await fs.writeFile(inputFile, "not an image");
    const results = await compressImages(
      [inputFile],
      outputDirectory,
      9,
      70,
    );

    assert.deepEqual(results, [{ success: false, file: inputFile }]);
    assert.deepEqual(await fs.readdir(outputDirectory), []);
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});
