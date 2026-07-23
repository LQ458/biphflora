#!/usr/bin/env node

const EXPECTED_COLLECTIONS = Object.freeze({
  plants: "posts",
  birds: "birdposts",
  pictures: "pics",
  birdPictures: "birdpics",
  artworks: "arts",
  creations: "creationbottoms",
  users: "users",
  plantEditRequests: "edittextrequests",
  birdEditRequests: "birdedittextrequests",
  auditEvents: "audit_events",
  searchEvents: "search_events",
  activities: "activities",
});

const KNOWN_AUDIT_ACTIONS = new Set([
  "catalog.create_requested",
  "catalog.edit_requested",
  "catalog.reviewed",
  "catalog.edit_reviewed",
  "catalog.deleted",
  "creation.uploaded",
  "creation.reviewed",
  "media.uploaded",
  "media.deleted",
  "user.role_changed",
  "user.deleted",
  "feature.changed",
]);
const CATALOG_TYPES = new Set(["plant", "bird"]);
const LANGUAGE_CATEGORIES = new Set(["cjk", "latin_script", "mixed_or_other"]);

function successfulAuditMatchStage() {
  return {
    $match: {
      action: { $in: [...KNOWN_AUDIT_ACTIONS] },
      status: { $gte: 200, $lt: 400 },
    },
  };
}

function numberOrZero(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function authorizationPipeline(field) {
  return [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: [`$${field}`, true] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: [`$${field}`, false] }, 1, 0] } },
        unspecified: {
          $sum: {
            $cond: [
              { $in: [{ $type: `$${field}` }, ["missing", "null"]] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $project: { _id: 0, total: 1, approved: 1, pending: 1, unspecified: 1 } },
  ];
}

function objectIdMonthPipeline() {
  return [
    { $match: { _id: { $type: "objectId" } } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m",
            date: { $toDate: "$_id" },
            timezone: "UTC",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: "$_id", count: 1 } },
  ];
}

function sanitizeMonthRows(rows) {
  return (Array.isArray(rows) ? rows : [])
    .filter((row) => /^\d{4}-(?:0[1-9]|1[0-2])$/.test(row.month))
    .map((row) => ({ month: row.month, count: numberOrZero(row.count) }))
    .sort((left, right) => left.month.localeCompare(right.month));
}

function sanitizeAuditRows(rows) {
  const actions = {};
  for (const row of Array.isArray(rows) ? rows : []) {
    const key = KNOWN_AUDIT_ACTIONS.has(row.action)
      ? row.action
      : "other_known_only_by_count";
    actions[key] = (actions[key] || 0) + numberOrZero(row.count);
  }
  return actions;
}

function sanitizeSearchRows(rows) {
  const summary = {
    total: 0,
    successfulResultEvents: 0,
    zeroResultEvents: 0,
    selectedEvents: 0,
    byCatalogType: { plant: 0, bird: 0, unknown: 0 },
    byLanguageCategory: {
      cjk: 0,
      latin_script: 0,
      mixed_or_other: 0,
      unknown: 0,
    },
  };
  for (const row of Array.isArray(rows) ? rows : []) {
    const count = numberOrZero(row.count);
    summary.total += count;
    const catalog = CATALOG_TYPES.has(row.catalogType)
      ? row.catalogType
      : "unknown";
    const language = LANGUAGE_CATEGORIES.has(row.languageCategory)
      ? row.languageCategory
      : "unknown";
    summary.byCatalogType[catalog] += count;
    summary.byLanguageCategory[language] += count;
    if (numberOrZero(row.resultCount) > 0)
      summary.successfulResultEvents += count;
    else summary.zeroResultEvents += count;
    if (row.selected === true) summary.selectedEvents += count;
  }
  summary.successfulResultRate = summary.total
    ? Number((summary.successfulResultEvents / summary.total).toFixed(4))
    : null;
  summary.zeroResultRate = summary.total
    ? Number((summary.zeroResultEvents / summary.total).toFixed(4))
    : null;
  summary.selectionEventRate = summary.total
    ? Number((summary.selectedEvents / summary.total).toFixed(4))
    : null;
  return summary;
}

async function aggregateRows(db, collection, pipeline) {
  return db
    .collection(collection)
    .aggregate(pipeline, { allowDiskUse: false, maxTimeMS: 120_000 })
    .toArray();
}

async function collectionNames(db) {
  const rows = await db.listCollections({}, { nameOnly: true }).toArray();
  return new Set(rows.map((row) => row.name));
}

async function authorizationSummary(db, available, collection, field) {
  if (!available.has(collection)) {
    return {
      available: false,
      total: 0,
      approved: 0,
      pending: 0,
      unspecified: 0,
    };
  }
  const [row = {}] = await aggregateRows(
    db,
    collection,
    authorizationPipeline(field),
  );
  return {
    available: true,
    total: numberOrZero(row.total),
    approved: numberOrZero(row.approved),
    pending: numberOrZero(row.pending),
    unspecified: numberOrZero(row.unspecified),
  };
}

async function currentCount(db, available, collection) {
  if (!available.has(collection)) return { available: false, count: 0 };
  return {
    available: true,
    count: await db
      .collection(collection)
      .countDocuments({}, { maxTimeMS: 120_000 }),
  };
}

async function objectIdCohort(db, available, collection) {
  if (!available.has(collection)) return [];
  return sanitizeMonthRows(
    await aggregateRows(db, collection, objectIdMonthPipeline()),
  );
}

function attributionSource(collection, fields) {
  return {
    collection,
    pipeline: [
      { $project: { labels: fields.map((field) => `$${field}`) } },
      { $unwind: "$labels" },
      {
        $project: {
          label: { $trim: { input: { $ifNull: ["$labels", ""] } } },
        },
      },
      { $match: { label: { $ne: "" } } },
    ],
  };
}

function availableAttributionSources(available) {
  return [
    attributionSource(EXPECTED_COLLECTIONS.plants, ["editor", "username"]),
    attributionSource(EXPECTED_COLLECTIONS.birds, ["editor", "username"]),
    attributionSource(EXPECTED_COLLECTIONS.pictures, ["takenBy"]),
    attributionSource(EXPECTED_COLLECTIONS.birdPictures, ["takenBy"]),
    attributionSource(EXPECTED_COLLECTIONS.artworks, ["artist"]),
    attributionSource(EXPECTED_COLLECTIONS.creations, [
      "creator",
      "photographer",
      "artist",
    ]),
    attributionSource(EXPECTED_COLLECTIONS.plantEditRequests, [
      "editor",
      "username",
    ]),
    attributionSource(EXPECTED_COLLECTIONS.birdEditRequests, [
      "editor",
      "username",
    ]),
  ].filter((source) => available.has(source.collection));
}

function attributionUnionPipeline(sources) {
  const [first, ...rest] = sources;
  return [
    ...first.pipeline,
    ...rest.map((source) => ({
      $unionWith: { coll: source.collection, pipeline: source.pipeline },
    })),
    { $group: { _id: "$label" } },
  ];
}

async function attributionSummary(db, available) {
  const sources = availableAttributionSources(available);
  if (sources.length === 0) {
    return {
      available: false,
      distinctCurrentAttributionLabels: 0,
      labelsMatchingCurrentAccounts: 0,
    };
  }
  const union = attributionUnionPipeline(sources);
  const [distinctRow = {}] = await aggregateRows(db, sources[0].collection, [
    ...union,
    { $count: "count" },
  ]);
  let labelsMatchingCurrentAccounts = 0;
  if (available.has(EXPECTED_COLLECTIONS.users)) {
    const [matchRow = {}] = await aggregateRows(db, sources[0].collection, [
      ...union,
      {
        $lookup: {
          from: EXPECTED_COLLECTIONS.users,
          localField: "_id",
          foreignField: "username",
          as: "accountMatches",
        },
      },
      { $match: { "accountMatches.0": { $exists: true } } },
      { $count: "count" },
    ]);
    labelsMatchingCurrentAccounts = numberOrZero(matchRow.count);
  }
  return {
    available: true,
    distinctCurrentAttributionLabels: numberOrZero(distinctRow.count),
    labelsMatchingCurrentAccounts,
  };
}

async function auditSummary(db, available) {
  const collection = EXPECTED_COLLECTIONS.auditEvents;
  if (!available.has(collection)) {
    return {
      available: false,
      totalSuccessfulEvents: 0,
      byAction: {},
      distinctActorSignatures: 0,
      monthlyEvents: [],
      monthlyActiveActorSignatures: [],
      observedTimeRange: null,
    };
  }

  const [actionRows, coverageRows, actorRows, monthlyRows, monthlyActorRows] =
    await Promise.all([
      aggregateRows(db, collection, [
        successfulAuditMatchStage(),
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $project: { _id: 0, action: "$_id", count: 1 } },
      ]),
      aggregateRows(db, collection, [
        successfulAuditMatchStage(),
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            first: { $min: "$occurredAt" },
            last: { $max: "$occurredAt" },
          },
        },
        { $project: { _id: 0, count: 1, first: 1, last: 1 } },
      ]),
      aggregateRows(db, collection, [
        successfulAuditMatchStage(),
        { $match: { actorSignature: { $type: "string", $ne: "" } } },
        { $group: { _id: "$actorSignature" } },
        { $count: "count" },
      ]),
      aggregateRows(db, collection, [
        successfulAuditMatchStage(),
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m",
                date: "$occurredAt",
                timezone: "UTC",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
      ]),
      aggregateRows(db, collection, [
        successfulAuditMatchStage(),
        { $match: { actorSignature: { $type: "string", $ne: "" } } },
        {
          $group: {
            _id: {
              month: {
                $dateToString: {
                  format: "%Y-%m",
                  date: "$occurredAt",
                  timezone: "UTC",
                },
              },
              actor: "$actorSignature",
            },
          },
        },
        { $group: { _id: "$_id.month", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
      ]),
    ]);
  const [coverage = {}] = coverageRows;
  const [actors = {}] = actorRows;
  return {
    available: true,
    totalSuccessfulEvents: numberOrZero(coverage.count),
    byAction: sanitizeAuditRows(actionRows),
    distinctActorSignatures: numberOrZero(actors.count),
    monthlyEvents: sanitizeMonthRows(monthlyRows),
    monthlyActiveActorSignatures: sanitizeMonthRows(monthlyActorRows),
    observedTimeRange:
      coverage.first && coverage.last
        ? {
            start: new Date(coverage.first).toISOString(),
            end: new Date(coverage.last).toISOString(),
          }
        : null,
  };
}

async function searchSummary(db, available) {
  const collection = EXPECTED_COLLECTIONS.searchEvents;
  if (!available.has(collection)) {
    return {
      available: false,
      observedTimeRange: null,
      monthlyEvents: [],
      ...sanitizeSearchRows([]),
    };
  }
  const [groupRows, coverageRows, monthlyRows] = await Promise.all([
    aggregateRows(db, collection, [
      {
        $group: {
          _id: {
            catalogType: "$catalogType",
            languageCategory: "$languageCategory",
            resultCount: "$resultCount",
            selected: "$selected",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          catalogType: "$_id.catalogType",
          languageCategory: "$_id.languageCategory",
          resultCount: "$_id.resultCount",
          selected: "$_id.selected",
          count: 1,
        },
      },
    ]),
    aggregateRows(db, collection, [
      {
        $group: {
          _id: null,
          first: { $min: "$occurredAt" },
          last: { $max: "$occurredAt" },
        },
      },
      { $project: { _id: 0, first: 1, last: 1 } },
    ]),
    aggregateRows(db, collection, [
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$occurredAt",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", count: 1 } },
    ]),
  ]);
  const summary = sanitizeSearchRows(groupRows);
  const [coverage = {}] = coverageRows;
  return {
    available: true,
    ...summary,
    monthlyEvents: sanitizeMonthRows(monthlyRows),
    observedTimeRange:
      coverage.first && coverage.last
        ? {
            start: new Date(coverage.first).toISOString(),
            end: new Date(coverage.last).toISOString(),
          }
        : null,
  };
}

async function collectMongoSnapshot(db) {
  const available = await collectionNames(db);
  const [
    plants,
    birds,
    creations,
    activities,
    pictures,
    birdPictures,
    artworks,
    registeredAccounts,
    plantEditRequests,
    birdEditRequests,
    audits,
    searches,
    attribution,
  ] = await Promise.all([
    authorizationSummary(
      db,
      available,
      EXPECTED_COLLECTIONS.plants,
      "authorization",
    ),
    authorizationSummary(
      db,
      available,
      EXPECTED_COLLECTIONS.birds,
      "authorization",
    ),
    authorizationSummary(db, available, EXPECTED_COLLECTIONS.creations, "auth"),
    authorizationSummary(
      db,
      available,
      EXPECTED_COLLECTIONS.activities,
      "auth",
    ),
    currentCount(db, available, EXPECTED_COLLECTIONS.pictures),
    currentCount(db, available, EXPECTED_COLLECTIONS.birdPictures),
    currentCount(db, available, EXPECTED_COLLECTIONS.artworks),
    currentCount(db, available, EXPECTED_COLLECTIONS.users),
    currentCount(db, available, EXPECTED_COLLECTIONS.plantEditRequests),
    currentCount(db, available, EXPECTED_COLLECTIONS.birdEditRequests),
    auditSummary(db, available),
    searchSummary(db, available),
    attributionSummary(db, available),
  ]);

  const cohortCollections = {
    plants: EXPECTED_COLLECTIONS.plants,
    birds: EXPECTED_COLLECTIONS.birds,
    pictures: EXPECTED_COLLECTIONS.pictures,
    birdPictures: EXPECTED_COLLECTIONS.birdPictures,
    artworks: EXPECTED_COLLECTIONS.artworks,
    creations: EXPECTED_COLLECTIONS.creations,
    plantEditRequests: EXPECTED_COLLECTIONS.plantEditRequests,
    birdEditRequests: EXPECTED_COLLECTIONS.birdEditRequests,
  };
  const cohortEntries = await Promise.all(
    Object.entries(cohortCollections).map(async ([label, collection]) => [
      label,
      await objectIdCohort(db, available, collection),
    ]),
  );

  return {
    current: {
      plants,
      birds,
      creations,
      activities,
      pictures,
      birdPictures,
      artworks,
      registeredAccounts,
      plantEditRequests,
      birdEditRequests,
    },
    actualOperations: { audits, searches },
    attribution,
    currentDocumentObjectIdMonthProxy: Object.fromEntries(cohortEntries),
  };
}

function evidenceRecord({
  metric,
  exactDefinition,
  value,
  source,
  query,
  collectedOn,
  confidence,
  limitations,
  timeWindow = "point-in-time",
}) {
  return {
    metric,
    exactDefinition,
    value,
    timeWindow,
    source,
    queryCalculation: query,
    botInternalTrafficFiltering: "not applicable",
    collectedOn,
    confidence,
    limitations,
  };
}

function formatProductMetrics(
  snapshot,
  collectedOn = new Date().toISOString(),
) {
  const current = snapshot.current || {};
  const audits = snapshot.actualOperations?.audits || {};
  const searches = snapshot.actualOperations?.searches || {};
  const attribution = snapshot.attribution || {};
  return {
    schemaVersion: 1,
    collectedOn,
    privacy: {
      rawIdentifiersEmitted: false,
      credentialsEmitted: false,
      accountOrAttributionLabelsEmitted: false,
      aggregateOnly: true,
    },
    ...snapshot,
    evidenceRecords: [
      evidenceRecord({
        metric: "current plant records",
        exactDefinition:
          "Current MongoDB plant documents split by authorization state.",
        value: current.plants || { available: false },
        source: "MongoDB posts collection",
        query: "Read-only group by authorization boolean.",
        collectedOn,
        confidence: current.plants?.available
          ? "direct current count"
          : "unavailable",
        limitations:
          "Excludes deleted records and is not a historical creation total.",
      }),
      evidenceRecord({
        metric: "current image/work documents",
        exactDefinition:
          "Current Pic, BirdPic, and Art MongoDB document counts.",
        value: {
          pictures: current.pictures?.count || 0,
          birdPictures: current.birdPictures?.count || 0,
          artworks: current.artworks?.count || 0,
        },
        source: "MongoDB media collections",
        query: "Read-only countDocuments.",
        collectedOn,
        confidence: "direct for available collections",
        limitations:
          "Documents are not proven unique physical image files or uploads.",
      }),
      evidenceRecord({
        metric: "registered accounts",
        exactDefinition: "Current user documents, not active users.",
        value: current.registeredAccounts?.count || 0,
        source: "MongoDB users collection",
        query: "Read-only countDocuments without selecting account fields.",
        collectedOn,
        confidence: current.registeredAccounts?.available
          ? "direct current count"
          : "unavailable",
        limitations:
          "Must not be described as active users or verified people.",
      }),
      evidenceRecord({
        metric: "successful audited product operations",
        exactDefinition:
          "Append-only successful audit events recorded while audit telemetry was enabled.",
        value: audits.totalSuccessfulEvents || 0,
        source: "MongoDB audit_events collection",
        query: "Read-only aggregate by allow-listed action and month.",
        collectedOn,
        confidence: audits.available
          ? "direct within telemetry coverage"
          : "unavailable",
        limitations:
          "Does not recover operations before telemetry, failed operations, or actions outside the audit route matrix.",
        timeWindow: audits.observedTimeRange || "no retained events",
      }),
      evidenceRecord({
        metric: "search telemetry events",
        exactDefinition:
          "Aggregate search events recorded while optional privacy-preserving telemetry was enabled.",
        value: searches.total || 0,
        source: "MongoDB search_events collection",
        query:
          "Read-only aggregate by fixed catalog/language/result/selection categories.",
        collectedOn,
        confidence: searches.available
          ? "direct within telemetry coverage"
          : "unavailable",
        limitations:
          "Does not recover earlier searches; an event is not necessarily a distinct person or session.",
        timeWindow: searches.observedTimeRange || "no retained events",
      }),
      evidenceRecord({
        metric: "distinct current attribution labels",
        exactDefinition:
          "Distinct non-empty editor/username/photographer/artist labels attached to current documents.",
        value: attribution.distinctCurrentAttributionLabels || 0,
        source: "MongoDB current content collections",
        query:
          "Server-side union/group/count; labels never leave MongoDB and are not emitted.",
        collectedOn,
        confidence: attribution.available
          ? "direct label count"
          : "unavailable",
        limitations:
          "Labels can alias, duplicate, or describe credits rather than people; not verified contributors or active users.",
      }),
    ],
    unavailable: {
      historicalDeletedRecords:
        "Current collections and ObjectId cohorts cannot recover deleted documents.",
      verifiedContributors:
        "Attribution labels, actor signatures, and accounts are not identity verification.",
      organizationUsage:
        "Requires consented qualitative or organization-level evidence.",
      preTelemetrySearchEditUploadTotals:
        "No verified historical append-only event source was found.",
    },
    limitations: [
      "ObjectId month cohorts describe creation time of currently retained documents only.",
      "Registered accounts are not active users.",
      "Audit actor signatures are pseudonymous account signatures, not verified people.",
      "Empty telemetry collections prove zero retained events, not zero historical use.",
      "No document values, usernames, attribution labels, credentials, or connection strings are emitted.",
    ],
  };
}

async function collectProductMetrics({
  db,
  snapshotProvider = collectMongoSnapshot,
  now = () => new Date(),
}) {
  if (!db) throw new TypeError("A MongoDB database handle is required");
  const snapshot = await snapshotProvider(db);
  return formatProductMetrics(snapshot, now().toISOString());
}

async function main() {
  require("dotenv").config();
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is not configured");
  }
  const mongoose = require("mongoose");
  const connection = mongoose.createConnection(process.env.MONGODB_URL, {
    maxPoolSize: 2,
    readPreference: "primaryPreferred",
    serverSelectionTimeoutMS: 15_000,
  });
  try {
    await connection.asPromise();
    const result = await collectProductMetrics({ db: connection.db });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    await connection.close().catch(() => {});
  }
}

if (require.main === module) {
  main().catch(() => {
    process.stderr.write(
      "Product metric collection failed; credentials and database errors were not emitted.\n",
    );
    process.exitCode = 1;
  });
}

module.exports = {
  EXPECTED_COLLECTIONS,
  collectMongoSnapshot,
  collectProductMetrics,
  formatProductMetrics,
  sanitizeAuditRows,
  sanitizeMonthRows,
  sanitizeSearchRows,
  successfulAuditMatchStage,
};
