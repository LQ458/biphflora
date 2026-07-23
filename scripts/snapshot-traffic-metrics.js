#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { collectTrafficMetrics } = require("./collect-traffic-metrics");

function usage() {
  return [
    "Usage: node scripts/snapshot-traffic-metrics.js [options] <oldest.log[.gz]> ... <newest.log>",
    "",
    "Options:",
    "  --output-dir <absolute path>  Private directory for daily aggregate JSON",
    "  --secret-file <path>         Root-readable HMAC secret file",
    "  --exclude-ip-file <path>     Optional internal/test address list",
    "  --as-of <ISO timestamp>      Cutoff within the snapshot UTC date",
    "  --site-host <hostname>       Public hostname used for source grouping",
    "  --snapshot-date <YYYY-MM-DD> Override the UTC snapshot filename date",
  ].join("\n");
}

function parseArguments(argv) {
  const result = { files: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--output-dir") result.outputDir = argv[++index];
    else if (argument === "--secret-file") result.secretFile = argv[++index];
    else if (argument === "--exclude-ip-file")
      result.excludeIpFile = argv[++index];
    else if (argument === "--as-of") result.asOf = argv[++index];
    else if (argument === "--site-host") result.siteHost = argv[++index];
    else if (argument === "--snapshot-date")
      result.snapshotDate = argv[++index];
    else if (argument === "--help" || argument === "-h") result.help = true;
    else if (argument.startsWith("--"))
      throw new Error(`Unknown option: ${argument}`);
    else result.files.push(argument);
  }
  return result;
}

function readNonEmptyLines(file) {
  if (!file) return new Set();
  return new Set(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function readSecret(secretFile) {
  if (secretFile) {
    const stat = fs.statSync(secretFile);
    if (!stat.isFile()) {
      throw new Error("--secret-file must be a regular file");
    }
    if (process.platform !== "win32" && (stat.mode & 0o077) !== 0) {
      throw new Error("--secret-file must not be group- or world-readable");
    }
  }
  const secret = secretFile
    ? fs.readFileSync(secretFile, "utf8").trim()
    : String(process.env.TRAFFIC_METRICS_HASH_SECRET || "").trim();
  if (secret.length < 32) {
    throw new Error(
      "Provide a stable secret of at least 32 characters via --secret-file or TRAFFIC_METRICS_HASH_SECRET",
    );
  }
  return secret;
}

function isInside(parent, child) {
  const relative = path.relative(parent, child);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

function canonicalProspectivePath(target) {
  const missing = [];
  let existing = target;
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) break;
    missing.unshift(path.basename(existing));
    existing = parent;
  }
  return path.join(fs.realpathSync(existing), ...missing);
}

function writeAppendOnlySnapshot(outputDir, snapshotDate, payload) {
  fs.mkdirSync(outputDir, { recursive: true, mode: 0o700 });
  fs.chmodSync(outputDir, 0o700);

  const destination = path.join(outputDir, `traffic-${snapshotDate}.json`);
  if (fs.existsSync(destination)) {
    return { destination, created: false };
  }

  const temporaryDirectory = fs.mkdtempSync(
    path.join(outputDir, ".traffic-snapshot-"),
  );
  const temporaryFile = path.join(temporaryDirectory, "snapshot.json");
  try {
    fs.writeFileSync(temporaryFile, `${JSON.stringify(payload, null, 2)}\n`, {
      mode: 0o600,
    });
    try {
      fs.linkSync(temporaryFile, destination);
      return { destination, created: true };
    } catch (error) {
      if (error.code === "EEXIST") return { destination, created: false };
      throw error;
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  if (!options.outputDir || !path.isAbsolute(options.outputDir)) {
    throw new Error("--output-dir must be an absolute path");
  }
  if (options.files.length === 0) {
    throw new Error("At least one Nginx access log is required");
  }

  const outputDir = path.resolve(options.outputDir);
  const repositoryRoot = path.resolve(__dirname, "..");
  if (isInside(repositoryRoot, outputDir)) {
    throw new Error("Traffic snapshots must be stored outside the repository");
  }

  const yesterday = new Date(Date.now() - 86_400_000)
    .toISOString()
    .slice(0, 10);
  const snapshotDate = options.snapshotDate || yesterday;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) {
    throw new Error("--snapshot-date must use YYYY-MM-DD");
  }
  const asOf = options.asOf || `${snapshotDate}T23:59:59.999Z`;
  const parsedCutoff = new Date(asOf);
  if (
    !Number.isFinite(parsedCutoff.getTime()) ||
    parsedCutoff.toISOString().slice(0, 10) !== snapshotDate
  ) {
    throw new Error("--as-of must be a valid timestamp within --snapshot-date");
  }

  const canonicalOutputDir = canonicalProspectivePath(outputDir);
  const canonicalRepositoryRoot = fs.realpathSync(repositoryRoot);
  if (isInside(canonicalRepositoryRoot, canonicalOutputDir)) {
    throw new Error("Traffic snapshots must be stored outside the repository");
  }
  const metrics = await collectTrafficMetrics({
    files: options.files,
    asOf,
    secret: readSecret(options.secretFile),
    excludedAddresses: readNonEmptyLines(options.excludeIpFile),
    options: {
      knownRoutesOnly: true,
      siteHost: options.siteHost,
    },
  });
  const snapshot = {
    ...metrics,
    definitions: {
      ...metrics.definitions,
      sessionCandidates:
        "Included requests sharing a stable, server-secret HMAC of IP plus normalized user agent, split after more than 30 minutes of inactivity.",
    },
    privacy: {
      ...metrics.privacy,
      signatureSecret: "stable externally supplied; never emitted",
    },
    retentionSnapshot: {
      snapshotDate,
      reportingCutoff: parsedCutoff.toISOString(),
      cadence: "daily",
      appendOnly: true,
      rawLogsRetainedAtSource: true,
    },
  };
  const result = writeAppendOnlySnapshot(outputDir, snapshotDate, snapshot);
  process.stdout.write(
    `${result.created ? "Created" : "Already exists"} ${result.destination}${os.EOL}`,
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = {
  canonicalProspectivePath,
  isInside,
  parseArguments,
  readSecret,
  writeAppendOnlySnapshot,
};
