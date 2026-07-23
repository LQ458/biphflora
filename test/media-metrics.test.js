const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const sharp = require("sharp");

const { getVariantFilePath } = require("../services/imageVariants");
const { collectMediaMetrics } = require("../scripts/collect-media-metrics");

async function createImage(filePath, format, options = {}) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  let pipeline = sharp({
    create: {
      width: options.width || 120,
      height: options.height || 80,
      channels: 3,
      background: options.background || { r: 80, g: 150, b: 40 },
    },
  });
  pipeline =
    format === "png"
      ? pipeline.png({ compressionLevel: options.compressionLevel || 6 })
      : format === "webp"
        ? pipeline.webp({ quality: options.quality || 75 })
        : pipeline.jpeg({ quality: options.quality || 90 });
  await pipeline.toFile(filePath);
}

test("media metrics report pairing, dimensions, bytes, and no filenames", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-media-metrics-"),
  );
  const originalDirectory = path.join(publicDirectory, "plantspic");
  const compressedDirectory = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
  );
  const pairedName = "private-paired.jpg";
  const unpairedName = "private-unpaired.png";
  const orphanName = "private-orphan.jpg";

  try {
    await createImage(path.join(originalDirectory, pairedName), "jpeg", {
      width: 900,
      height: 600,
      quality: 96,
    });
    await createImage(path.join(originalDirectory, unpairedName), "png");
    await createImage(path.join(compressedDirectory, pairedName), "jpeg", {
      width: 900,
      height: 600,
      quality: 45,
    });
    await createImage(path.join(compressedDirectory, orphanName), "jpeg");
    const variantPath = getVariantFilePath(
      `/plantspic/${pairedName}`,
      480,
      publicDirectory,
    );
    await createImage(variantPath, "webp", {
      width: 480,
      height: 320,
    });

    const metrics = await collectMediaMetrics({ publicDirectory });
    assert.equal(metrics.originals.fileCount, 2);
    assert.equal(metrics.originals.readableImageCount, 2);
    assert.equal(metrics.compressed.fileCount, 2);
    assert.equal(metrics.compressed.pairing.exactFilenamePairCount, 1);
    assert.equal(metrics.compressed.pairing.coveragePercent, 50);
    assert.equal(metrics.compressed.pairing.orphanDerivativeCount, 1);
    assert.equal(metrics.variants["480"].pairing.exactFilenamePairCount, 1);
    assert.equal(metrics.variants["480"].pairing.coveragePercent, 50);
    assert.equal(metrics.variants["960"].fileCount, 0);
    assert.equal(metrics.variants["1600"].fileCount, 0);
    assert.equal(metrics.privacy.filenamesIncluded, false);
    assert.ok(Number.isFinite(metrics.compressed.pairing.sizeReductionPercent));
    assert.equal(
      metrics.storage.measuredTotalBytes,
      metrics.storage.originalBytes +
        metrics.storage.compressedBytes +
        metrics.storage.variantBytes,
    );

    const serialized = JSON.stringify(metrics);
    assert.equal(serialized.includes(pairedName), false);
    assert.equal(serialized.includes(unpairedName), false);
    assert.equal(serialized.includes(orphanName), false);
    assert.equal(serialized.includes(publicDirectory), false);
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});
