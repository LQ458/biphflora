const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const {
  cleanupFiles,
  getCompressedPlantMediaDirectory,
  getCompressedPlantMediaPath,
  getPlantMediaDirectory,
  getPlantMediaPath,
  getUploadedFiles,
} = require("../services/mediaFiles");

test("media path helpers retain the existing public directory layout", () => {
  const applicationRoot = path.resolve(__dirname, "..");
  const plantMediaDirectory = path.join(
    applicationRoot,
    "public",
    "plantspic",
  );
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
  assert.deepEqual(
    getUploadedFiles({ pic: [firstFile], art: [secondFile] }),
    [firstFile, secondFile],
  );
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
