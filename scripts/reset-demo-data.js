#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const Post = require("../models/post");
const Pic = require("../models/pic");
const {
  cleanupImageVariants,
  getVariantFallbackFilePaths,
} = require("../services/imageVariants");
const {
  DEFAULT_MONGODB_URL,
  FIXTURES,
  SAFE_DATABASE_NAME,
  assertSafeMongoUrl,
} = require("./seed-demo-data");

const LEGACY_FIXTURE_MEDIA_PATHS = Object.freeze([
  "/plantspic/DemoAlpha-fixture.png",
]);

async function unlinkIfPresent(filePath) {
  try {
    await fs.unlink(filePath);
    return 1;
  } catch (error) {
    if (error.code === "ENOENT") {
      return 0;
    }
    throw error;
  }
}

async function removeFixtureMedia(mediaPath) {
  const variantResults = await cleanupImageVariants(mediaPath);
  if (variantResults.some(({ status }) => status === "failed")) {
    throw new Error("Unable to remove one or more demo image variants");
  }

  const fallbackPaths = getVariantFallbackFilePaths(mediaPath);
  const fallbackFilesRemoved =
    (await unlinkIfPresent(fallbackPaths.original)) +
    (await unlinkIfPresent(fallbackPaths.compressed));

  return (
    fallbackFilesRemoved +
    variantResults.filter(({ status }) => status === "removed").length
  );
}

async function resetDemoData(env = process.env) {
  const mongoUrl = assertSafeMongoUrl(env.MONGODB_URL || DEFAULT_MONGODB_URL);
  const mediaPaths = [
    ...FIXTURES.map(({ filename }) => `/plantspic/${filename}`),
    ...LEGACY_FIXTURE_MEDIA_PATHS,
  ];

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 5_000,
  });

  let filesRemoved = 0;
  for (const mediaPath of mediaPaths) {
    filesRemoved += await removeFixtureMedia(mediaPath);
  }

  const [postResult, picResult] = await Promise.all([
    Post.deleteMany({
      latinName: { $in: FIXTURES.map(({ latinName }) => latinName) },
    }),
    Pic.deleteMany({
      $or: [
        { code: { $in: FIXTURES.map(({ code }) => code) } },
        { path: { $in: mediaPaths } },
      ],
    }),
  ]);

  return {
    filesRemoved,
    mediaRemoved: picResult.deletedCount,
    postsRemoved: postResult.deletedCount,
  };
}

async function main() {
  require("dotenv").config();

  try {
    const totals = await resetDemoData();
    console.log(
      [
        `Reset synthetic fixtures in ${SAFE_DATABASE_NAME}.`,
        `Removed: ${totals.postsRemoved} plants, ${totals.mediaRemoved} media records,`,
        `${totals.filesRemoved} generated files.`,
      ].join(" "),
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Demo reset failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  LEGACY_FIXTURE_MEDIA_PATHS,
  resetDemoData,
};
