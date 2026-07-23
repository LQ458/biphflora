const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  classifyRoute,
  collectTrafficMetrics,
  parseNginxLine,
} = require("../scripts/collect-traffic-metrics");

function logLine({
  ip,
  time,
  method = "GET",
  target = "/",
  status = 200,
  referrer = "-",
  userAgent = "Mozilla/5.0 DesktopBrowser/123.4",
}) {
  return `${ip} - - [${time}] "${method} ${target} HTTP/1.1" ${status} 123 "${referrer}" "${userAgent}"`;
}

test("parses combined Nginx logs without retaining query strings as routes", () => {
  const parsed = parseNginxLine(
    logLine({
      ip: "203.0.113.9",
      time: "22/Jul/2026:08:15:30 +0800",
      target: "/search/rose?q=private",
    }),
  );
  assert.equal(
    new Date(parsed.timestamp).toISOString(),
    "2026-07-22T00:15:30.000Z",
  );
  assert.equal(classifyRoute("/search/rose"), "plant_detail_or_search");
});

test("collects bounded, privacy-safe request and session candidates", async (context) => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "traffic-metrics-"),
  );
  context.after(() =>
    fs.rm(temporaryDirectory, { recursive: true, force: true }),
  );
  const logPath = path.join(temporaryDirectory, "access.log");
  const desktop = "Mozilla/5.0 PrivateBrowser/123.4 SecretUA";
  const mobile = "Mozilla/5.0 (iPhone) Mobile/17.4 PrivateMobile";
  const lines = [
    logLine({
      ip: "198.51.100.1",
      time: "01/Jan/2026:00:00:00 +0000",
      target: "/?query=private-search-term",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.1",
      time: "01/Jan/2026:00:10:00 +0000",
      target: "/search/rose",
      referrer: "https://private-search.example/?q=secret",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.2",
      time: "01/Jun/2026:00:00:00 +0000",
      target: "/databasePlant",
      userAgent: mobile,
    }),
    logLine({
      ip: "198.51.100.2",
      time: "01/Jun/2026:00:00:01 +0000",
      target: "/databasePlant?repeat=secret",
      userAgent: mobile,
    }),
    logLine({
      ip: "198.51.100.2",
      time: "01/Jun/2026:00:31:00 +0000",
      target: "/search/lily",
      userAgent: mobile,
    }),
    logLine({
      ip: "198.51.100.3",
      time: "22/Jul/2026:00:00:00 +0000",
      target: "/aboutus",
      referrer: "https://private-referrer.example/path",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.3",
      time: "22/Jul/2026:00:31:00 +0000",
      target: "/activities",
      referrer: "https://social.example/post",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.11",
      time: "22/Jul/2026:00:32:00 +0000",
      method: "POST",
      target: "/api/uploadPic?account=private-label",
      referrer: "https://biphflora.com/upload",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.3",
      time: "22/Jul/2026:00:33:00 +0000",
      target: "/aboutus",
      status: 500,
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.20",
      time: "22/Jul/2026:00:34:00 +0000",
      userAgent: "Googlebot/2.1",
    }),
    logLine({
      ip: "198.51.100.21",
      time: "22/Jul/2026:00:35:00 +0000",
      target: "/static/app.js",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.22",
      time: "22/Jul/2026:00:36:00 +0000",
      target: "/api/adminToggle",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.23",
      time: "22/Jul/2026:00:37:00 +0000",
      target: "/.env",
      userAgent: desktop,
    }),
    logLine({
      ip: "198.51.100.24",
      time: "22/Jul/2026:00:38:00 +0000",
      userAgent: "curl/8.0",
    }),
    logLine({
      ip: "198.51.100.25",
      time: "22/Jul/2026:00:39:00 +0000",
      target: "/api/health/ready",
      userAgent: desktop,
    }),
    logLine({
      ip: "127.0.0.1",
      time: "22/Jul/2026:00:40:00 +0000",
      userAgent: desktop,
    }),
    ...[0, 1, 2, 3].map((second) =>
      logLine({
        ip: "198.51.100.30",
        time: `22/Jul/2026:00:41:0${second} +0000`,
        target: `/path-${second}`,
        userAgent: desktop,
      }),
    ),
  ];
  await fs.writeFile(logPath, `${lines.join("\n")}\n`);

  const result = await collectTrafficMetrics({
    files: [logPath],
    asOf: "2026-07-23T00:00:00.000Z",
    secret: "test-only-secret",
    options: { burstThreshold: 3 },
  });

  const all = result.windows.all_retained_logs;
  assert.equal(all.filteredRequests, 8);
  assert.equal(all.documentLoadCandidates, 6);
  assert.equal(all.sessionCandidateMetrics.sessionCandidates, 6);
  assert.equal(result.windows.last_30_days.filteredRequests, 4);
  assert.equal(
    result.windows.last_30_days.averageFilteredRequestsPerCalendarDay,
    0.13,
  );
  assert.equal(
    result.windows.last_30_days.averageSessionCandidatesPerCalendarDay,
    0.1,
  );
  assert.equal(result.windows.last_90_days.filteredRequests, 6);
  assert.equal(result.windows.last_365_days.filteredRequests, 8);
  assert.equal(result.filtering.rapid_duplicate_refresh, 1);
  assert.equal(result.filtering.anomalous_signature_minute_burst, 4);
  assert.equal(result.filtering.recognized_bot, 1);
  assert.equal(result.filtering.static_asset, 1);
  assert.equal(result.filtering.administration_route, 1);
  assert.equal(result.filtering.obvious_scanner, 1);
  assert.equal(result.filtering.automation_or_test_client, 1);
  assert.equal(result.filtering.health_check, 1);
  assert.equal(result.filtering.known_internal_address, 1);
  assert.equal(result.successfulProductEndpointResponses.total, 1);
  assert.equal(
    result.successfulProductEndpointResponses.byFixedCategory
      .media_upload_response,
    1,
  );
  assert.deepEqual(result.peaks.highestFilteredRequestDay, {
    period: "2026-07-22",
    filteredRequests: 4,
  });
  assert.ok(all.estimatedVisitorSignatures.value >= 3);
  assert.ok(all.estimatedVisitorSignatures.value <= 5);
  assert.equal(all.topRouteCategories[0].category, "about");
  assert.equal(all.topRouteCategories[0].filteredRequests, 2);
  assert.deepEqual(
    result.monthlyTrend.map(({ month, sessionCandidatesByStartMonth }) => ({
      month,
      sessionCandidatesByStartMonth,
    })),
    [
      { month: "2026-01", sessionCandidatesByStartMonth: 1 },
      { month: "2026-06", sessionCandidatesByStartMonth: 2 },
      { month: "2026-07", sessionCandidatesByStartMonth: 3 },
    ],
  );

  const serialized = JSON.stringify(result);
  for (const privateValue of [
    "198.51.100.1",
    "SecretUA",
    "private-search-term",
    "private-search.example",
    "private-referrer.example",
    "private-label",
  ]) {
    assert.equal(serialized.includes(privateValue), false);
  }
  assert.equal(result.privacy.rawIdentifiersEmitted, false);
  assert.match(result.unavailable.verifiedUniqueVisitors, /No consented/);
  assert.match(result.limitations.join(" "), /crossing the window boundary/);

  await fs.appendFile(
    logPath,
    `${logLine({
      ip: "198.51.100.40",
      time: "22/Jul/2026:00:45:00 +0000",
      target: "/not-a-known-product-route",
      userAgent: desktop,
    })}\n`,
  );
  const strictResult = await collectTrafficMetrics({
    files: [logPath],
    asOf: "2026-07-23T00:00:00.000Z",
    secret: "test-only-secret",
    options: { burstThreshold: 3, knownRoutesOnly: true },
  });
  assert.equal(strictResult.windows.all_retained_logs.filteredRequests, 8);
  assert.equal(strictResult.filtering.unrecognized_product_route, 5);
  assert.equal(strictResult.filtering.knownRoutesOnly, true);
});

test("merges rotated logs chronologically and deduplicates by route across a minute", async (context) => {
  const temporaryDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "traffic-rotations-"),
  );
  context.after(() =>
    fs.rm(temporaryDirectory, { recursive: true, force: true }),
  );
  const firstLog = path.join(temporaryDirectory, "first.log");
  const secondLog = path.join(temporaryDirectory, "second.log");
  const common = {
    ip: "198.51.100.90",
    userAgent: "Mozilla/5.0 RotatedBrowser/1.0",
  };

  await fs.writeFile(
    firstLog,
    [
      logLine({
        ...common,
        time: "01/Jan/2026:00:00:59 +0000",
        target: "/aboutus",
      }),
      logLine({
        ...common,
        time: "01/Jan/2026:00:01:01 +0000",
        target: "/activities",
      }),
    ].join("\n") + "\n",
  );
  await fs.writeFile(
    secondLog,
    [
      logLine({
        ...common,
        time: "01/Jan/2026:00:01:02 +0000",
        target: "/activities",
      }),
      logLine({
        ...common,
        time: "01/Jan/2026:00:01:00 +0000",
        target: "/aboutus",
      }),
    ].join("\n") + "\n",
  );

  const result = await collectTrafficMetrics({
    files: [firstLog, secondLog],
    asOf: "2026-01-01T00:02:00.000Z",
    secret: "test-only-secret",
  });

  assert.equal(result.sourceSummary.fileCount, 2);
  assert.equal(result.windows.all_retained_logs.filteredRequests, 2);
  assert.equal(result.filtering.rapid_duplicate_refresh, 2);
  assert.equal(result.filtering.nonChronologicalEntries, 0);
  assert.equal(result.filtering.late_beyond_reorder_window, undefined);
  assert.equal(result.filtering.reorderWindowHours, 24);
});
