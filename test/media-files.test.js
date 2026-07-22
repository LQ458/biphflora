const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const {
  assertDerivativeCleanupSucceeded,
  cleanupFiles,
  cleanupPlantMediaDerivatives,
  getCompressedPlantMediaDirectory,
  getCompressedPlantMediaPath,
  getPlantMediaDirectory,
  getPlantMediaPath,
  getUploadedFiles,
  renamePlantMediaDerivatives,
} = require("../services/mediaFiles");
const {
  VARIANT_WIDTHS,
  getVariantFilePath,
} = require("../services/imageVariants");

test("derivative cleanup failures are not accepted as a completed deletion", () => {
  assert.doesNotThrow(() =>
    assertDerivativeCleanupSucceeded({
      compressed: "missing",
      variants: [{ status: "removed", width: 480 }],
    }),
  );
  assert.throws(
    () =>
      assertDerivativeCleanupSucceeded({
        compressed: "removed",
        variants: [{ status: "failed", width: 480 }],
      }),
    /Unable to remove/,
  );
});

test("media path helpers retain the existing public directory layout", () => {
  const applicationRoot = path.resolve(__dirname, "..");
  const plantMediaDirectory = path.join(applicationRoot, "public", "plantspic");
  const compressedPlantMediaDirectory = path.join(
    applicationRoot,
    "public",
    "compressed",
    "plantspic",
  );

  assert.equal(getPlantMediaDirectory(), `${plantMediaDirectory}${path.sep}`);
  assert.equal(
    getCompressedPlantMediaDirectory(),
    `${compressedPlantMediaDirectory}${path.sep}`,
  );
  assert.equal(
    getPlantMediaPath("example.png"),
    path.join(plantMediaDirectory, "example.png"),
  );
  assert.equal(
    getCompressedPlantMediaPath("example.png"),
    path.join(compressedPlantMediaDirectory, "example.png"),
  );
});

test("upload collection and cleanup retain array, field-map, and missing-file behavior", async () => {
  const firstFile = { path: "/tmp/first" };
  const secondFile = { path: "/tmp/second" };

  assert.deepEqual(getUploadedFiles([firstFile, secondFile]), [
    firstFile,
    secondFile,
  ]);
  assert.deepEqual(getUploadedFiles({ pic: [firstFile], art: [secondFile] }), [
    firstFile,
    secondFile,
  ]);
  assert.deepEqual(getUploadedFiles(undefined), []);

  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-media-files-"),
  );
  const existingFile = path.join(temporaryDirectory, "existing.tmp");
  const missingFile = path.join(temporaryDirectory, "missing.tmp");
  await fs.writeFile(existingFile, "temporary upload");

  try {
    await cleanupFiles([existingFile, missingFile]);
    assert.equal(
      await fs
        .stat(existingFile)
        .then(() => true)
        .catch(() => false),
      false,
    );
  } finally {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("derivative rename and cleanup cover compressed and versioned files only", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-media-derivatives-"),
  );
  const oldFilename = "old.jpg";
  const newFilename = "new.jpg";
  const originalPath = path.join(publicDirectory, "plantspic", oldFilename);
  const compressedPath = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
    oldFilename,
  );

  try {
    await fs.mkdir(path.dirname(originalPath), { recursive: true });
    await fs.mkdir(path.dirname(compressedPath), { recursive: true });
    await fs.writeFile(originalPath, "original");
    await fs.writeFile(compressedPath, "compressed");
    for (const width of VARIANT_WIDTHS) {
      const variantPath = getVariantFilePath(
        `/plantspic/${oldFilename}`,
        width,
        publicDirectory,
      );
      await fs.mkdir(path.dirname(variantPath), { recursive: true });
      await fs.writeFile(variantPath, `variant-${width}`);
    }

    const renameResult = await renamePlantMediaDerivatives(
      oldFilename,
      newFilename,
      { publicDirectory },
    );
    assert.equal(renameResult.compressed, "renamed");
    assert.deepEqual(
      renameResult.variants.map(({ status, width }) => ({ status, width })),
      VARIANT_WIDTHS.map((width) => ({ status: "renamed", width })),
    );
    assert.equal(await fs.readFile(originalPath, "utf8"), "original");

    const cleanupResult = await cleanupPlantMediaDerivatives(newFilename, {
      publicDirectory,
    });
    assert.equal(cleanupResult.compressed, "removed");
    assert.deepEqual(
      cleanupResult.variants.map(({ status, width }) => ({ status, width })),
      VARIANT_WIDTHS.map((width) => ({ status: "removed", width })),
    );
    assert.equal(await fs.readFile(originalPath, "utf8"), "original");
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});

test("derivative helpers reject path traversal and do not overwrite", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-media-no-overwrite-"),
  );
  const compressedDirectory = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
  );

  try {
    await fs.mkdir(compressedDirectory, { recursive: true });
    await fs.writeFile(path.join(compressedDirectory, "old.jpg"), "old");
    await fs.writeFile(path.join(compressedDirectory, "new.jpg"), "new");
    const result = await renamePlantMediaDerivatives("old.jpg", "new.jpg", {
      publicDirectory,
    });
    assert.equal(result.compressed, "destination-exists");
    assert.equal(
      await fs.readFile(path.join(compressedDirectory, "old.jpg"), "utf8"),
      "old",
    );
    assert.equal(
      await fs.readFile(path.join(compressedDirectory, "new.jpg"), "utf8"),
      "new",
    );
    await assert.rejects(
      cleanupPlantMediaDerivatives("../outside.jpg", { publicDirectory }),
      /directory path/,
    );
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});
