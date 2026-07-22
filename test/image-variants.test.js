const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const sharp = require("sharp");

const {
  VARIANT_WIDTHS,
  assertSafeMediaPath,
  cleanupImageVariants,
  createSerialTaskQueue,
  generateImageVariants,
  getVariantFallbackFilePaths,
  getVariantFilePath,
  getVariantPublicPath,
  parseVariantRequestPath,
} = require("../services/imageVariants");
const { runBackfill } = require("../scripts/backfill-media-variants");

async function createImage(filePath, width = 2000, height = 1200) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 42, g: 120, b: 64 },
    },
  })
    .jpeg({ quality: 90 })
    .toFile(filePath);
}

test("versioned WebP variants are bounded, deterministic, and never enlarged", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-variants-"),
  );
  const largeInput = path.join(publicDirectory, "plantspic", "large.jpg");
  const smallInput = path.join(publicDirectory, "plantspic", "small.jpg");

  try {
    await createImage(largeInput);
    await createImage(smallInput, 320, 200);

    const largeResults = await generateImageVariants(largeInput, {
      publicDirectory,
    });
    assert.deepEqual(
      largeResults.map(({ status, width }) => ({ status, width })),
      VARIANT_WIDTHS.map((width) => ({ status: "created", width })),
    );

    for (const width of VARIANT_WIDTHS) {
      const metadata = await sharp(
        getVariantFilePath("/plantspic/large.jpg", width, publicDirectory),
      ).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, width);
      assert.ok(metadata.height <= 1200);
    }

    await generateImageVariants(smallInput, {
      publicDirectory,
      widths: [480],
    });
    const smallMetadata = await sharp(
      getVariantFilePath("plantspic/small.jpg", 480, publicDirectory),
    ).metadata();
    assert.equal(smallMetadata.width, 320);
    assert.equal(smallMetadata.height, 200);
    assert.equal(
      getVariantPublicPath("/plantspic/small.jpg", 480),
      "/public/variants/v1/480/plantspic/small.jpg.webp",
    );
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});

test("variant publication preserves an existing destination", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-variants-existing-"),
  );
  const input = path.join(publicDirectory, "plantspic", "existing.png");

  try {
    await createImage(input, 900, 600);
    await generateImageVariants(input, {
      publicDirectory,
      widths: [480],
    });
    const destination = getVariantFilePath(
      "/plantspic/existing.png",
      480,
      publicDirectory,
    );
    const before = await fs.readFile(destination);

    await createImage(input, 900, 600);
    const secondRun = await generateImageVariants(input, {
      publicDirectory,
      widths: [480],
    });
    assert.equal(secondRun[0].status, "existing");
    assert.deepEqual(await fs.readFile(destination), before);
    assert.deepEqual(
      (await fs.readdir(path.dirname(destination))).filter((name) =>
        name.includes(".tmp-"),
      ),
      [],
    );
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});

test("serialized deletion runs after pending generation and leaves no variant", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-variant-queue-"),
  );
  const input = path.join(publicDirectory, "plantspic", "queued.jpg");
  const queue = createSerialTaskQueue();

  try {
    await createImage(input, 900, 600);
    const generation = queue.enqueue(() =>
      generateImageVariants(input, { publicDirectory }),
    );
    const deletion = queue.enqueue(async () => {
      await cleanupImageVariants("/plantspic/queued.jpg", { publicDirectory });
      await fs.unlink(input);
    });
    await Promise.all([generation, deletion]);
    await queue.drain();

    for (const width of VARIANT_WIDTHS) {
      await assert.rejects(
        fs.stat(
          getVariantFilePath("/plantspic/queued.jpg", width, publicDirectory),
        ),
        { code: "ENOENT" },
      );
    }
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});

test("variant paths reject traversal and unsupported widths", () => {
  assert.throws(() => assertSafeMediaPath("../secret.jpg"));
  assert.throws(() => assertSafeMediaPath("plantspic/../../secret.jpg"));
  assert.throws(() => getVariantPublicPath("/other/file.jpg", 480));
  assert.throws(() => getVariantPublicPath("/plantspic/file.jpg", 481));
  assert.deepEqual(
    parseVariantRequestPath(
      "/public/variants/v1/480/plantspic/nested/file.jpg.webp",
    ),
    { mediaPath: "/plantspic/nested/file.jpg", width: 480 },
  );
  assert.deepEqual(
    parseVariantRequestPath(
      "/public/variants/v1/960/plantspic/nested/%E8%8A%B1%20one.jpg.webp",
    ),
    { mediaPath: "/plantspic/nested/花 one.jpg", width: 960 },
  );
  assert.throws(() =>
    parseVariantRequestPath(
      "/public/variants/v1/480/plantspic/../../secret.jpg.webp",
    ),
  );
  assert.throws(() =>
    parseVariantRequestPath(
      "/public/variants/v1/480/plantspic/%2e%2e/secret.jpg.webp",
    ),
  );
  assert.throws(() =>
    parseVariantRequestPath("/public/variants/v2/480/plantspic/file.jpg.webp"),
  );
  const fallbacks = getVariantFallbackFilePaths(
    "/plantspic/nested/file.jpg",
    "/safe/public",
  );
  assert.equal(
    fallbacks.compressed,
    path.resolve("/safe/public/compressed/plantspic/nested/file.jpg"),
  );
  assert.equal(
    fallbacks.original,
    path.resolve("/safe/public/plantspic/nested/file.jpg"),
  );
});

test("backfill defaults to dry-run and reports aggregates only", async () => {
  const publicDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "biphflora-backfill-"),
  );
  const input = path.join(publicDirectory, "plantspic", "private-name.jpg");

  try {
    await createImage(input, 800, 600);
    const dryRun = await runBackfill({ publicDirectory });
    assert.equal(dryRun.mode, "dry-run");
    assert.equal(dryRun.eligibleImageCount, 1);
    assert.equal(dryRun.plannedVariantCount, 3);
    assert.equal(dryRun.createdVariantCount, 0);
    await assert.rejects(
      fs.stat(
        getVariantFilePath("/plantspic/private-name.jpg", 480, publicDirectory),
      ),
      { code: "ENOENT" },
    );
    assert.equal(JSON.stringify(dryRun).includes("private-name"), false);

    const writeRun = await runBackfill({ publicDirectory, dryRun: false });
    assert.equal(writeRun.mode, "write-new-variants");
    assert.equal(writeRun.createdVariantCount, 3);
    assert.equal(writeRun.failedVariantCount, 0);
  } finally {
    await fs.rm(publicDirectory, { recursive: true, force: true });
  }
});
