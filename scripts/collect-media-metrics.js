#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");
const {
  PUBLIC_DIRECTORY,
  VARIANT_VERSION,
  VARIANT_WIDTHS,
  getVariantFilePath,
} = require("../services/imageVariants");
const {
  DEFAULT_CONCURRENCY,
  MAX_CONCURRENCY,
  listFiles,
  mapWithConcurrency,
} = require("./backfill-media-variants");

function round(value, digits = 2) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
}

function median(values) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

async function inspectFile(filePath, relativePath) {
  const stat = await fs.stat(filePath);
  try {
    const metadata = await sharp(filePath, { failOn: "error" }).metadata();
    return {
      relativePath,
      bytes: stat.size,
      format: metadata.format || "unknown",
      width: metadata.width || null,
      height: metadata.height || null,
      readable: Boolean(metadata.width && metadata.height && metadata.format),
    };
  } catch (_) {
    return {
      relativePath,
      bytes: stat.size,
      format: "unreadable",
      width: null,
      height: null,
      readable: false,
    };
  }
}

async function inspectDirectory(directory, concurrency) {
  const files = await listFiles(directory);
  return mapWithConcurrency(files, concurrency, (filePath) =>
    inspectFile(
      filePath,
      path.relative(directory, filePath).split(path.sep).join("/"),
    ),
  );
}

function countBy(records, selector) {
  return Object.fromEntries(
    [
      ...records.reduce((counts, record) => {
        const key = selector(record);
        counts.set(key, (counts.get(key) || 0) + 1);
        return counts;
      }, new Map()),
    ].sort(([left], [right]) => left.localeCompare(right)),
  );
}

function summarizeRecords(records) {
  const readable = records.filter((record) => record.readable);
  const bytes = records.map((record) => record.bytes);
  const widths = readable.map((record) => record.width);
  const heights = readable.map((record) => record.height);
  const totalBytes = bytes.reduce((total, value) => total + value, 0);

  return {
    fileCount: records.length,
    readableImageCount: readable.length,
    unreadableFileCount: records.length - readable.length,
    totalBytes,
    averageBytes: records.length ? round(totalBytes / records.length) : null,
    medianBytes: round(median(bytes)),
    formats: countBy(records, (record) => record.format),
    dimensions: {
      averageWidth: readable.length
        ? round(
            widths.reduce((total, value) => total + value, 0) / readable.length,
          )
        : null,
      averageHeight: readable.length
        ? round(
            heights.reduce((total, value) => total + value, 0) /
              readable.length,
          )
        : null,
      medianWidth: round(median(widths)),
      medianHeight: round(median(heights)),
      minimumWidth: widths.length ? Math.min(...widths) : null,
      maximumWidth: widths.length ? Math.max(...widths) : null,
      minimumHeight: heights.length ? Math.min(...heights) : null,
      maximumHeight: heights.length ? Math.max(...heights) : null,
    },
  };
}

function summarizePairs(
  originalRecords,
  derivativeRecords,
  derivativeKey,
  originalKeyFromDerivative = (record) => record.relativePath,
) {
  const derivativeMap = new Map(
    derivativeRecords.map((record) => [record.relativePath, record]),
  );
  const originalKeys = new Set(
    originalRecords.map((record) => record.relativePath),
  );
  const pairs = originalRecords
    .map((original) => [original, derivativeMap.get(derivativeKey(original))])
    .filter(
      ([original, derivative]) =>
        original.readable && derivative && derivative.readable,
    );
  const originalBytes = pairs.reduce(
    (total, [original]) => total + original.bytes,
    0,
  );
  const derivativeBytes = pairs.reduce(
    (total, [, derivative]) => total + derivative.bytes,
    0,
  );
  const savingsBytes = originalBytes - derivativeBytes;

  return {
    exactFilenamePairCount: pairs.length,
    coveragePercent: originalRecords.length
      ? round((pairs.length / originalRecords.length) * 100)
      : null,
    unpairedOriginalCount: originalRecords.length - pairs.length,
    orphanDerivativeCount: derivativeRecords.filter(
      (record) => !originalKeys.has(originalKeyFromDerivative(record)),
    ).length,
    pairedOriginalBytes: originalBytes,
    pairedDerivativeBytes: derivativeBytes,
    savingsBytes,
    sizeReductionPercent: originalBytes
      ? round((savingsBytes / originalBytes) * 100)
      : null,
    derivativeToOriginalRatio: originalBytes
      ? round(derivativeBytes / originalBytes, 4)
      : null,
  };
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

async function collectMediaMetrics({
  publicDirectory = PUBLIC_DIRECTORY,
  concurrency = DEFAULT_CONCURRENCY,
} = {}) {
  const safeConcurrency = normalizeConcurrency(concurrency);
  const originalDirectory = path.join(publicDirectory, "plantspic");
  const compressedDirectory = path.join(
    publicDirectory,
    "compressed",
    "plantspic",
  );
  const originalRecords = await inspectDirectory(
    originalDirectory,
    safeConcurrency,
  );
  const compressedRecords = await inspectDirectory(
    compressedDirectory,
    safeConcurrency,
  );
  const variantMetrics = {};
  let totalVariantBytes = 0;

  for (const width of VARIANT_WIDTHS) {
    const variantDirectory = path.dirname(
      getVariantFilePath("/plantspic/placeholder.jpg", width, publicDirectory),
    );
    const variantRecords = await inspectDirectory(
      variantDirectory,
      safeConcurrency,
    );
    const summary = summarizeRecords(variantRecords);
    totalVariantBytes += summary.totalBytes;
    variantMetrics[String(width)] = {
      ...summary,
      pairing: summarizePairs(
        originalRecords,
        variantRecords,
        (record) => `${record.relativePath}.webp`,
        (record) =>
          record.relativePath.endsWith(".webp")
            ? record.relativePath.slice(0, -".webp".length)
            : record.relativePath,
      ),
    };
  }

  const originalSummary = summarizeRecords(originalRecords);
  const compressedSummary = summarizeRecords(compressedRecords);

  return {
    metricVersion: 1,
    collectedOn: new Date().toISOString(),
    source: "server media filesystem (aggregate only)",
    scope: {
      originals: "public/plantspic",
      compressed: "public/compressed/plantspic",
      variants: `public/variants/${VARIANT_VERSION}/{width}/plantspic`,
      recursive: true,
      symbolicLinksFollowed: false,
    },
    originals: originalSummary,
    compressed: {
      ...compressedSummary,
      pairing: summarizePairs(
        originalRecords,
        compressedRecords,
        (record) => record.relativePath,
      ),
    },
    variants: variantMetrics,
    storage: {
      originalBytes: originalSummary.totalBytes,
      compressedBytes: compressedSummary.totalBytes,
      variantBytes: totalVariantBytes,
      measuredTotalBytes:
        originalSummary.totalBytes +
        compressedSummary.totalBytes +
        totalVariantBytes,
    },
    definitions: {
      pair: "An original and derivative whose relative filenames match exactly; WebP variants add only the .webp suffix.",
      sizeReductionPercent:
        "100 * (sum paired original bytes - sum paired derivative bytes) / sum paired original bytes.",
      coveragePercent:
        "100 * readable exact pairs / all regular files in the original directory.",
    },
    privacy: {
      filenamesIncluded: false,
      databaseRecordsIncluded: false,
      accountDataIncluded: false,
    },
    limitations: [
      "Filesystem files can include uploads, archives, and derivatives; file count is not a unique-photo count.",
      "Pairing is filesystem-based and does not establish that a database record references each file.",
      "Compression percentages use only readable exact-name pairs and can be negative when a derivative is larger.",
    ],
  };
}

function parseArguments(argumentsList) {
  const options = { concurrency: DEFAULT_CONCURRENCY };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--public-root") {
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
  collectMediaMetrics(parseArguments(process.argv.slice(2)))
    .then((metrics) =>
      process.stdout.write(`${JSON.stringify(metrics, null, 2)}\n`),
    )
    .catch(() => {
      process.stderr.write(
        "Media metric collection failed; no source paths were reported.\n",
      );
      process.exitCode = 1;
    });
}

module.exports = {
  collectMediaMetrics,
  inspectDirectory,
  median,
  parseArguments,
  round,
  summarizePairs,
  summarizeRecords,
};
