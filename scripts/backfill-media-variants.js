#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const {
  PUBLIC_DIRECTORY,
  VARIANT_QUALITY,
  VARIANT_WIDTHS,
  generateImageVariants,
  getVariantFilePath,
} = require("../services/imageVariants");

const IMAGE_EXTENSIONS = new Set([".jpeg", ".jpg", ".png", ".webp"]);
const DEFAULT_CONCURRENCY = 2;
const MAX_CONCURRENCY = 4;

async function listFiles(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(items.length, concurrency);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await worker(items[currentIndex]);
      }
    }),
  );

  return results;
}

async function isReadableImage(filePath) {
  try {
    const metadata = await sharp(filePath, { failOn: "error" }).metadata();
    return Boolean(metadata.width && metadata.height && metadata.format);
  } catch (_) {
    return false;
  }
}

async function fileExists(filePath) {
  return fs
    .stat(filePath)
    .then((stat) => stat.isFile())
    .catch((error) => {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    });
}

function normalizeConcurrency(concurrency) {
  const parsed = Number(concurrency);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_CONCURRENCY) {
    throw new RangeError(
      `Concurrency must be an integer from 1 to ${MAX_CONCURRENCY}`,
    );
  }
  return parsed;
}

async function inspectForBackfill(inputFilePath, publicDirectory) {
  const relativePath = path
    .relative(publicDirectory, inputFilePath)
    .split(path.sep)
    .join("/");
  const mediaPath = `/${relativePath}`;

  if (!(await isReadableImage(inputFilePath))) {
    return { readable: false, existing: 0, missing: 0 };
  }

  let existing = 0;
  for (const width of VARIANT_WIDTHS) {
    if (
      await fileExists(getVariantFilePath(mediaPath, width, publicDirectory))
    ) {
      existing += 1;
    }
  }

  return {
    readable: true,
    existing,
    missing: VARIANT_WIDTHS.length - existing,
  };
}

async function runBackfill({
  publicDirectory = PUBLIC_DIRECTORY,
  dryRun = true,
  concurrency = DEFAULT_CONCURRENCY,
} = {}) {
  const safeConcurrency = normalizeConcurrency(concurrency);
  const plantMediaDirectory = path.join(publicDirectory, "plantspic");
  const allFiles = await listFiles(plantMediaDirectory);
  const candidateFiles = allFiles.filter((filePath) =>
    IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );
  const inspections = await mapWithConcurrency(
    candidateFiles,
    safeConcurrency,
    (filePath) => inspectForBackfill(filePath, publicDirectory),
  );
  const readableFiles = candidateFiles.filter(
    (_, index) => inspections[index].readable,
  );
  let createdVariantCount = 0;
  let failedVariantCount = 0;
  let raceExistingVariantCount = 0;

  if (!dryRun) {
    const generationResults = await mapWithConcurrency(
      readableFiles,
      safeConcurrency,
      (filePath) => generateImageVariants(filePath, { publicDirectory }),
    );

    for (const fileResults of generationResults) {
      for (const result of fileResults) {
        if (result.status === "created") {
          createdVariantCount += 1;
        } else if (result.status === "failed") {
          failedVariantCount += 1;
        } else if (result.status === "existing") {
          raceExistingVariantCount += 1;
        }
      }
    }
  }

  const existingVariantCount = inspections.reduce(
    (total, inspection) => total + inspection.existing,
    0,
  );
  const plannedVariantCount = inspections.reduce(
    (total, inspection) => total + inspection.missing,
    0,
  );

  return {
    metricVersion: 1,
    collectedOn: new Date().toISOString(),
    mode: dryRun ? "dry-run" : "write-new-variants",
    source: "public/plantspic",
    widths: [...VARIANT_WIDTHS],
    outputFormat: "webp",
    quality: VARIANT_QUALITY,
    concurrency: safeConcurrency,
    originalFileCount: allFiles.length,
    eligibleExtensionCount: candidateFiles.length,
    eligibleImageCount: readableFiles.length,
    unreadableCandidateCount: candidateFiles.length - readableFiles.length,
    existingVariantCount,
    plannedVariantCount,
    createdVariantCount,
    failedVariantCount,
    raceOrPreviouslyExistingCount: raceExistingVariantCount,
    guarantees: {
      originalFilesModified: false,
      existingVariantsOverwritten: false,
      defaultModeWritesFiles: false,
    },
    limitations: [
      "Counts cover regular JPEG, PNG, and WebP files currently present under public/plantspic.",
      "Dry-run counts candidates and existing outputs but does not estimate encoded byte size.",
    ],
  };
}

function parseArguments(argumentsList) {
  const options = { dryRun: true, concurrency: DEFAULT_CONCURRENCY };

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--write") {
      options.dryRun = false;
    } else if (argument === "--dry-run") {
      options.dryRun = true;
    } else if (argument === "--public-root") {
      options.publicDirectory = argumentsList[index + 1];
      index += 1;
    } else if (argument === "--concurrency") {
      options.concurrency = argumentsList[index + 1];
      index += 1;
    } else {
      throw new Error("Unsupported argument");
    }
  }

  return options;
}

if (require.main === module) {
  runBackfill(parseArguments(process.argv.slice(2)))
    .then((result) =>
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`),
    )
    .catch(() => {
      process.stderr.write(
        "Media variant backfill failed; no source paths were reported.\n",
      );
      process.exitCode = 1;
    });
}

module.exports = {
  DEFAULT_CONCURRENCY,
  IMAGE_EXTENSIONS,
  MAX_CONCURRENCY,
  listFiles,
  mapWithConcurrency,
  parseArguments,
  runBackfill,
};
