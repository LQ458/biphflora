#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const Fuse = require("fuse.js");

const DEFAULT_CATALOG_SIZE = 153;
const DEFAULT_ITERATIONS = 1_000;
const INDEX_RUNS = 100;

const FUSE_OPTIONS = Object.freeze({
  isCaseSensitive: false,
  includeScore: false,
  shouldSort: true,
  includeMatches: false,
  findAllMatches: true,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.5,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
  keys: [
    { name: "latinName", weight: 0.3 },
    { name: "chineseName", weight: 0.3 },
    { name: "commonName", weight: 0.4 },
    { name: "otherNames", weight: 0.1 },
  ],
});

const QUERY_CASES = Object.freeze([
  "Demo genus 42",
  "演示植物42",
  "Synthetic Plant 42",
  "fixture-42",
  "Dmo genus 42",
  "species-not-present",
]);

function readPositiveInteger(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find((argument) => argument.startsWith(prefix));
  if (!value) {
    return fallback;
  }

  const parsed = Number(value.slice(prefix.length));
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new TypeError(`${name} must be a positive integer`);
  }
  return parsed;
}

function createSyntheticCatalog(size) {
  return Array.from({ length: size }, (_, index) => ({
    _id: `fixture-${String(index).padStart(4, "0")}`,
    latinName: `Demo genus ${index}`,
    chineseName: `演示植物${index}`,
    commonName: `Synthetic Plant ${index}`,
    otherNames: `fixture-${index}`,
  }));
}

function percentile(values, fraction) {
  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.min(
    ordered.length - 1,
    Math.max(0, Math.ceil(ordered.length * fraction) - 1),
  );
  return ordered[index];
}

function summarize(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    samples: values.length,
    meanMs: total / values.length,
    p50Ms: percentile(values, 0.5),
    p95Ms: percentile(values, 0.95),
    p99Ms: percentile(values, 0.99),
  };
}

function roundSummary(summary) {
  return Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [
      key,
      typeof value === "number" && key !== "samples"
        ? Number(value.toFixed(4))
        : value,
    ]),
  );
}

function benchmark({
  catalogSize = DEFAULT_CATALOG_SIZE,
  iterations = DEFAULT_ITERATIONS,
} = {}) {
  const catalog = createSyntheticCatalog(catalogSize);
  const indexDurations = [];

  for (let run = 0; run < INDEX_RUNS; run += 1) {
    const startedAt = performance.now();
    new Fuse(catalog, FUSE_OPTIONS);
    indexDurations.push(performance.now() - startedAt);
  }

  const index = new Fuse(catalog, FUSE_OPTIONS);
  for (const query of QUERY_CASES) {
    index.search(query);
  }

  const queryDurations = [];
  let resultCountChecksum = 0;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (const query of QUERY_CASES) {
      const startedAt = performance.now();
      const results = index.search(query);
      queryDurations.push(performance.now() - startedAt);
      resultCountChecksum += results.length;
    }
  }

  const fusePackage = JSON.parse(
    fs.readFileSync(
      path.join(path.dirname(require.resolve("fuse.js")), "..", "package.json"),
      "utf8",
    ),
  );

  return {
    definition:
      "Single-process local Fuse.js index/search timing over deterministic synthetic name records; excludes network, React rendering, MongoDB, and production load.",
    environment: {
      node: process.version,
      platform: `${process.platform}-${process.arch}`,
      fuse: fusePackage.version,
    },
    input: {
      catalogSize,
      indexRuns: INDEX_RUNS,
      queryCases: QUERY_CASES.length,
      queryIterations: iterations,
      totalMeasuredQueries: queryDurations.length,
    },
    indexBuild: roundSummary(summarize(indexDurations)),
    query: roundSummary(summarize(queryDurations)),
    resultCountChecksum,
  };
}

if (require.main === module) {
  try {
    const result = benchmark({
      catalogSize: readPositiveInteger("size", DEFAULT_CATALOG_SIZE),
      iterations: readPositiveInteger("iterations", DEFAULT_ITERATIONS),
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`Search benchmark failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_CATALOG_SIZE,
  DEFAULT_ITERATIONS,
  FUSE_OPTIONS,
  QUERY_CASES,
  benchmark,
  createSyntheticCatalog,
};
