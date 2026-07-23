#!/usr/bin/env node
"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
const sharp = require("sharp");
const Post = require("../models/post");
const Pic = require("../models/pic");
const {
  PUBLIC_DIRECTORY,
  cleanupImageVariants,
  generateImageVariants,
} = require("../services/imageVariants");

const SAFE_DATABASE_NAME = "biphflora_demo";
const DEFAULT_MONGODB_URL = "mongodb://127.0.0.1:27017/biphflora_demo";
const FIXTURE_TIMESTAMP = "2026-01-01 00:00:00";

const FIXTURES = Object.freeze([
  {
    key: "alpha",
    latinName: "DemoAlpha",
    chineseName: "演示植物甲",
    commonName: "Synthetic Plant Alpha",
    otherNames: "Local fixture A",
    season: "spring",
    filename: "Demo Alpha-fixture.png",
    code: "DEMO-PLANT-ALPHA-01",
    background: "#e3f2dc",
    leaf: "#477a43",
    accent: "#f3c969",
  },
  {
    key: "beta",
    latinName: "DemoBeta",
    chineseName: "演示植物乙",
    commonName: "Synthetic Plant Beta",
    otherNames: "Local fixture B",
    season: "summer",
    filename: "DemoBeta-fixture.png",
    code: "DEMO-PLANT-BETA-01",
    background: "#dcecf2",
    leaf: "#39706b",
    accent: "#e58f65",
  },
  {
    key: "gamma",
    latinName: "DemoGamma",
    chineseName: "演示植物丙",
    commonName: "Synthetic Plant Gamma",
    otherNames: "Local fixture C",
    season: "autumn",
    filename: "DemoGamma-fixture.png",
    code: "DEMO-PLANT-GAMMA-01",
    background: "#f2e8d5",
    leaf: "#687b3c",
    accent: "#c96c4b",
  },
]);

function assertSafeMongoUrl(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("MONGODB_URL must be a non-empty local MongoDB URL");
  }

  const candidate = value.trim();
  let parsed;

  try {
    parsed = new URL(candidate);
  } catch (_) {
    throw new Error("MONGODB_URL must be a valid MongoDB URL");
  }

  const authorityStart = candidate.indexOf("//") + 2;
  const authorityEnd = candidate.indexOf("/", authorityStart);
  const authority = candidate.slice(authorityStart, authorityEnd);

  if (parsed.protocol !== "mongodb:") {
    throw new Error("Demo seed only supports the mongodb protocol");
  }

  if (parsed.username || parsed.password || authority.includes("@")) {
    throw new Error("Demo seed refuses MongoDB URLs containing credentials");
  }

  if (
    parsed.search ||
    parsed.hash ||
    candidate.includes("?") ||
    candidate.includes("#")
  ) {
    throw new Error(
      "Demo seed refuses MongoDB URLs containing query parameters or fragments",
    );
  }

  if (authority.includes(",")) {
    throw new Error("Demo seed refuses multi-host MongoDB URLs");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (hostname !== "127.0.0.1" && hostname !== "::1") {
    throw new Error(
      "Demo seed only accepts the literal loopback hosts 127.0.0.1 or ::1",
    );
  }

  if (parsed.pathname !== `/${SAFE_DATABASE_NAME}`) {
    throw new Error(
      `Demo seed only writes to the dedicated ${SAFE_DATABASE_NAME} database`,
    );
  }

  return candidate;
}

function fixtureSvg({ background, leaf, accent }) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <rect width="640" height="480" fill="${background}"/>
      <circle cx="320" cy="240" r="154" fill="#ffffff" opacity="0.42"/>
      <path d="M320 382 C318 316 318 244 320 116" stroke="${leaf}" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M316 258 C225 248 181 196 172 132 C251 132 306 173 316 258 Z" fill="${leaf}"/>
      <path d="M324 310 C415 298 459 245 468 181 C389 182 334 224 324 310 Z" fill="${leaf}" opacity="0.86"/>
      <circle cx="320" cy="112" r="40" fill="${accent}"/>
      <circle cx="292" cy="127" r="28" fill="${accent}" opacity="0.78"/>
      <circle cx="348" cy="127" r="28" fill="${accent}" opacity="0.78"/>
    </svg>
  `);
}

async function writeAtomically(destination, pipeline, extension) {
  const temporary = `${destination}.tmp-${process.pid}-${Date.now()}${extension}`;

  try {
    await pipeline.toFile(temporary);
    await fs.rename(temporary, destination);
  } catch (error) {
    await fs.unlink(temporary).catch(() => {});
    throw error;
  }
}

async function writeFixtureMedia(fixture) {
  const originalDirectory = path.join(PUBLIC_DIRECTORY, "plantspic");
  const compressedDirectory = path.join(
    PUBLIC_DIRECTORY,
    "compressed",
    "plantspic",
  );
  const originalPath = path.join(originalDirectory, fixture.filename);
  const compressedPath = path.join(compressedDirectory, fixture.filename);
  const mediaPath = `/plantspic/${fixture.filename}`;

  await Promise.all([
    fs.mkdir(originalDirectory, { recursive: true }),
    fs.mkdir(compressedDirectory, { recursive: true }),
  ]);

  await writeAtomically(
    originalPath,
    sharp(fixtureSvg(fixture)).png({
      compressionLevel: 9,
      palette: true,
    }),
    ".png",
  );
  await writeAtomically(
    compressedPath,
    sharp(originalPath)
      .resize({ width: 360, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true }),
    ".png",
  );

  const cleanupResults = await cleanupImageVariants(mediaPath);
  if (cleanupResults.some(({ status }) => status === "failed")) {
    throw new Error(`Unable to refresh variants for fixture ${fixture.key}`);
  }

  const variantResults = await generateImageVariants(originalPath);
  if (variantResults.some(({ status }) => status === "failed")) {
    throw new Error(`Unable to generate variants for fixture ${fixture.key}`);
  }

  return mediaPath;
}

async function upsertFixture(fixture, mediaPath) {
  const postResult = await Post.updateOne(
    { latinName: fixture.latinName },
    {
      $set: {
        chineseName: fixture.chineseName,
        commonName: fixture.commonName,
        authorization: true,
        otherNames: fixture.otherNames,
        location: "Synthetic local demo garden",
        additionalInfo:
          "Synthetic local-development fixture; not a real species record or observation.",
        link: [],
        chineseLink: [],
        dbType: "plant",
      },
      $setOnInsert: {
        postingtime: FIXTURE_TIMESTAMP,
      },
      $unset: {
        editor: "",
        username: "",
      },
    },
    { upsert: true },
  );

  const picResult = await Pic.updateOne(
    { code: fixture.code },
    {
      $set: {
        plant: fixture.latinName,
        art: "photography",
        takenBy: "Anonymous synthetic fixture",
        season: fixture.season,
        path: mediaPath,
        featured: false,
        time: "Synthetic fixture",
        location: "Synthetic local demo garden",
        dbType: "plant",
      },
      $setOnInsert: {
        postingtime: new Date("2026-01-01T00:00:00.000Z"),
      },
    },
    { upsert: true },
  );

  return {
    postsInserted: postResult.upsertedCount,
    postsUpdated: postResult.modifiedCount,
    mediaInserted: picResult.upsertedCount,
    mediaUpdated: picResult.modifiedCount,
  };
}

async function seedDemoData(env = process.env) {
  const mongoUrl = assertSafeMongoUrl(env.MONGODB_URL || DEFAULT_MONGODB_URL);
  const totals = {
    postsInserted: 0,
    postsUpdated: 0,
    mediaInserted: 0,
    mediaUpdated: 0,
  };

  await mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 5_000,
  });

  for (const fixture of FIXTURES) {
    const mediaPath = await writeFixtureMedia(fixture);
    const result = await upsertFixture(fixture, mediaPath);

    for (const key of Object.keys(totals)) {
      totals[key] += result[key];
    }
  }

  return totals;
}

async function main() {
  require("dotenv").config();

  try {
    const totals = await seedDemoData();
    console.log(
      [
        `Seeded ${FIXTURES.length} synthetic plant/media fixtures into ${SAFE_DATABASE_NAME}.`,
        `Inserted: ${totals.postsInserted} plants, ${totals.mediaInserted} media.`,
        `Updated: ${totals.postsUpdated} plants, ${totals.mediaUpdated} media.`,
      ].join(" "),
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Demo seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_MONGODB_URL,
  FIXTURES,
  SAFE_DATABASE_NAME,
  assertSafeMongoUrl,
  seedDemoData,
};
