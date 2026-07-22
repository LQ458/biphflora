const assert = require("node:assert/strict");
const test = require("node:test");

const {
  collectProductMetrics,
  formatProductMetrics,
  sanitizeAuditRows,
  sanitizeMonthRows,
  sanitizeSearchRows,
  successfulAuditMatchStage,
} = require("../scripts/collect-product-metrics");

test("sanitizes aggregate category rows to fixed, non-identifying output", () => {
  const auditMatch = successfulAuditMatchStage().$match;
  assert.deepEqual(auditMatch.status, { $gte: 200, $lt: 400 });
  assert.ok(auditMatch.action.$in.includes("media.uploaded"));
  assert.deepEqual(
    sanitizeAuditRows([
      { action: "media.uploaded", count: 4 },
      { action: "private-account-label", count: 2 },
    ]),
    { "media.uploaded": 4, other_known_only_by_count: 2 },
  );
  assert.deepEqual(
    sanitizeMonthRows([
      { month: "2026-07", count: 3 },
      { month: "private-date-label", count: 99 },
    ]),
    [{ month: "2026-07", count: 3 }],
  );
  const searches = sanitizeSearchRows([
    {
      catalogType: "plant",
      languageCategory: "cjk",
      resultCount: 2,
      selected: true,
      count: 3,
    },
    {
      catalogType: "private-catalog",
      languageCategory: "private-language",
      resultCount: 0,
      selected: false,
      count: 1,
    },
  ]);
  assert.equal(searches.total, 4);
  assert.equal(searches.successfulResultEvents, 3);
  assert.equal(searches.zeroResultEvents, 1);
  assert.equal(searches.byCatalogType.unknown, 1);
  assert.equal(searches.byLanguageCategory.unknown, 1);
  assert.equal(JSON.stringify(searches).includes("private"), false);
});

test("formats current counts without upgrading proxies into user claims", async () => {
  const snapshot = {
    current: {
      plants: {
        available: true,
        total: 153,
        approved: 152,
        pending: 1,
        unspecified: 0,
      },
      pictures: { available: true, count: 970 },
      birdPictures: { available: true, count: 0 },
      artworks: { available: true, count: 27 },
      registeredAccounts: { available: true, count: 3 },
    },
    actualOperations: {
      audits: {
        available: true,
        totalSuccessfulEvents: 8,
        distinctActorSignatures: 2,
        byAction: { "media.uploaded": 8 },
        observedTimeRange: {
          start: "2026-07-01T00:00:00.000Z",
          end: "2026-07-20T00:00:00.000Z",
        },
      },
      searches: {
        available: true,
        total: 12,
        successfulResultEvents: 9,
        zeroResultEvents: 3,
        observedTimeRange: {
          start: "2026-07-01T00:00:00.000Z",
          end: "2026-07-20T00:00:00.000Z",
        },
      },
    },
    attribution: {
      available: true,
      distinctCurrentAttributionLabels: 5,
      labelsMatchingCurrentAccounts: 2,
    },
    currentDocumentObjectIdMonthProxy: {
      plants: [{ month: "2026-01", count: 4 }],
    },
  };
  const fakeDb = { marker: "never serialized" };
  let receivedDb;
  const output = await collectProductMetrics({
    db: fakeDb,
    snapshotProvider: async (db) => {
      receivedDb = db;
      return snapshot;
    },
    now: () => new Date("2026-07-23T00:00:00.000Z"),
  });
  assert.equal(receivedDb, fakeDb);
  assert.equal(output.current.registeredAccounts.count, 3);
  assert.match(
    output.limitations.join(" "),
    /Registered accounts are not active users/,
  );
  assert.match(
    output.unavailable.verifiedContributors,
    /not identity verification/,
  );
  assert.equal(output.privacy.accountOrAttributionLabelsEmitted, false);
  assert.equal(JSON.stringify(output).includes("never serialized"), false);

  const formatted = formatProductMetrics(snapshot, "2026-07-23T00:00:00.000Z");
  const accountRecord = formatted.evidenceRecords.find(
    (record) => record.metric === "registered accounts",
  );
  assert.match(accountRecord.limitations, /active users/);
  const attributionRecord = formatted.evidenceRecords.find(
    (record) => record.metric === "distinct current attribution labels",
  );
  assert.match(attributionRecord.limitations, /not verified contributors/);
});
