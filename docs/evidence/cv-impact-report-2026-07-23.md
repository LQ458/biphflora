# BiphFlora CV impact evidence — 2026-07-23

This report keeps CV-useful evidence while separating direct facts, operational
proxies, low-confidence audience estimates, and unavailable claims. Raw access
logs, addresses, user agents, account fields, attribution labels, media names,
and credentials remained on the production host.

## CV-safe summary

The following wording is supported by the current evidence:

- Built and operated a bilingual campus biodiversity platform with public
  evidence dating to January 2024, currently cataloguing 153 plant records,
  970 picture records, 27 artwork records, and 18 approved creation entries.
- Maintained a 2.11 GB canonical-media collection of 1,033 readable files,
  backfilled complete responsive 480/960/1600 px WebP coverage, and connected
  successful new uploads to non-blocking derivative generation with legacy
  fallback while retaining every measured canonical file and legacy URL.
- Reduced aggregate bytes versus the paired originals by 98.68% at 480 px,
  96.52% at 960 px, and 93.57% at 1600 px across all 1,033 media files; browser
  `srcset` now selects one size for the rendered slot.
- Analyzed 1.13 million retained Nginx log entries using fixed bot, scanner,
  static-asset, health-check, administration, internal/test, burst, duplicate,
  and unknown-route filters. The strict result contains 182,149 recognized
  product-route requests and 37,409 successful document-load candidates from
  2024-10-31 through 2026-07-22.
- Retained logs contain 964 filtered 2xx responses across upload, edit, review,
  and deletion endpoints: 372 media uploads, 24 creation uploads, 75 edit
  submissions, 93 edit reviews, 295 catalogue reviews, 28 creation reviews,
  29 catalogue deletions, and 48 media deletions. These are successful endpoint
  responses, not people or guaranteed unique actions.
- Maintained a 39-test backend verification suite, added responsive media
  fallback, privacy-safe evidence collectors, readiness checks, and an
  additive production rollout path without a database schema migration.

Do not turn these bullets into claims of verified users, uptime, continuous
service, unique uploads, or verified contributors.

## Lifecycle evidence

```text
Metric: publicly observable service-history lower bound
Exact definition: interval between the earliest retained successful public HTML snapshot and the latest verified public response
Value: 919 days (more than 30 months)
Time window: 2024-01-15 through 2026-07-22
Source: Internet Archive CDX and production HTTPS health observation
Query/calculation: calendar-day difference between the two observations
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct for the two observations
Limitations: does not prove exact launch date, continuous availability, or uptime between observations
```

The domain registration event is 2023-10-12. Registration is not a launch
event. The current protected release was deployed on 2026-07-22. Complete
historical deployment count, interruption periods, platform migrations,
incident count, downtime, and recovery time remain unavailable.

## Traffic and audience evidence

The reproducible strict calculation uses recognized product routes only. It
excludes unrecognized routes to reduce distributed scanner noise, so it can
also omit a legitimate route missing from the fixed classifier.

```text
Metric: retained Nginx log entries
Exact definition: physical entries in the retained frontend access log at collection; 83 parsed entries after the reporting cutoff were excluded from window metrics
Value: 1,131,690 entries; 1,081,407 parseable; 50,283 unparseable; 83 parsed entries after the cutoff excluded
Time window: retained log begins 2024-10-31; metric cutoff 2026-07-22T17:10:05Z
Source: production Nginx combined access log
Query/calculation: streaming line count and combined-log parser
Bot/internal-traffic filtering: none for this source-volume metric
Collected on: 2026-07-23
Confidence: direct for retained log entries
Limitations: HTTP requests are not pageviews, sessions, visits, or people; retention gaps may exist
```

```text
Metric: strict recognized product-route traffic
Exact definition: requests to fixed product route categories after bot, scanner, static, protocol, health, administration, known internal/test, burst, rapid-duplicate, and unrecognized-route exclusions
Value: all retained 182,149 requests / 37,409 2xx document-load candidates; last 365 days 126,753 / 23,215; last 90 days 21,989 / 6,398; last 30 days 5,708 / 1,802
Time window: 2024-10-31 through 2026-07-22T17:10:05Z, plus trailing 365/90/30-day windows at that cutoff
Source: production Nginx combined access log
Query/calculation: scripts/collect-traffic-metrics.js --known-routes-only with 2xx GET/HEAD non-API requests as document-load candidates
Bot/internal-traffic filtering: fixed user-agent/path rules; static and health removal; 120 requests/signature/minute burst removal; same signature/path/method within 2 seconds deduplicated
Collected on: 2026-07-23
Confidence: medium for filtered request and server-visible document-load candidates
Limitations: SPA navigation, direct 3000/3001 traffic, proxy-cache hits, and omitted legitimate routes can cause undercount; a document-load candidate is not a complete pageview
```

The strict all-retained request mix was 87.10% desktop-or-other, 12.70%
mobile, and 0.20% tablet. Source categories were 81.67%
direct-or-unattributed, 14.67% self-referral, 3.17% external referral, 0.45%
search, 0.01% social, and 0.04% invalid-or-unattributed. These are shares of
filtered requests, not shares of people or sessions.

The highest strict filtered-request day was 2026-02-18 with 1,153 requests;
the highest hour was 2025-09-02T18:00Z with 392 requests. They are operational
request peaks, not visitor peaks.

```text
Metric: filtered 30-minute session candidates and estimated address/user-agent signatures
Exact definition: strict included requests grouped by an ephemeral HMAC of the log address field plus normalized user agent, split after more than 30 minutes of inactivity; signatures estimated with 4,096-register HyperLogLog
Value: all retained 96,307 session candidates / approximately 35,897 signatures; last 365 days 58,067 / approximately 22,320; last 90 days 15,326 / approximately 6,720; last 30 days 5,010 / approximately 2,619
Time window: same retained and trailing windows as the strict traffic metric
Source: production Nginx combined access log
Query/calculation: streaming HMAC sessionization; HyperLogLog relative standard error approximately 1.63%
Bot/internal-traffic filtering: same strict filtering as recognized product-route traffic
Collected on: 2026-07-23
Confidence: low
Limitations: public DNS uses an upstream proxy while origin Nginx does not restore a verified client address; the collector reordered entries within a 24-hour bounded window and observed no later included entry; results can be edge-dependent and must not be called visits, verified unique visitors, or people
```

Verified unique visitors, valid visits, new/returning users, geography, bounce
rate, average visit duration, and pages per visit remain unavailable.

## Product and contribution evidence

```text
Metric: current product records
Exact definition: current MongoDB documents, split by relevant authorization state
Value: 153 plants (152 approved, 1 pending); 0 birds; 970 Pic documents; 27 Art documents; 18 approved creation entries; 1 pending plant edit request; 3 registered accounts
Time window: point-in-time at 2026-07-22T17:15:44Z
Source: production MongoDB collections
Query/calculation: read-only countDocuments and authorization grouping
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct current counts
Limitations: current records exclude deleted history; picture/art documents are not proven unique files; registered accounts are not active users
```

```text
Metric: successful fixed product-endpoint responses
Exact definition: 2xx Nginx responses from fixed product endpoints after bot, automation, missing-user-agent, and known-internal exclusions
Value: 4,049 total: 1,547 plant-index API responses; 1,538 plant-detail API responses; 372 media-upload responses; 24 creation-upload responses; 75 edit-submission responses; 93 edit-review responses; 295 catalogue-review responses; 28 creation-review responses; 29 catalogue-delete responses; 48 media-delete responses
Time window: 2024-10-31 through 2026-07-22T17:10:05Z
Source: production Nginx combined access log
Query/calculation: exact method/path allow-list and 2xx status aggregation; query strings discarded
Bot/internal-traffic filtering: bot/automation/missing-UA/known-internal exclusions; no identity deduplication
Collected on: 2026-07-23
Confidence: direct for matching 2xx responses; proxy for completed business actions
Limitations: repeated tests can remain; one upload request can carry multiple files; index responses are not searches; responses are not users or unique actions
```

The 964 write/review/delete responses in the CV-safe summary are the sum of
the eight mutating workflow categories above. They are the best retained
historical evidence of real workflow use, but the newer append-only audit and
search collections still contain zero events, so pre-telemetry search counts,
search success, exact upload totals, and actor-level activity cannot be
reconstructed.

```text
Metric: distinct current attribution labels
Exact definition: distinct non-empty editor, username, photographer, artist, and creator labels attached to current MongoDB documents
Value: 29 labels; 1 label matches a current account username
Time window: point-in-time at 2026-07-22T17:15:44Z
Source: production MongoDB current content collections
Query/calculation: server-side union/group/count; labels never left MongoDB
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct label count
Limitations: labels can alias, duplicate, or credit non-account contributors; they are not verified people, contributors, active users, or organization members
```

The current-document ObjectId cohorts place retained plant records between
2025-02 and 2025-10 and retained picture records between 2025-02 and 2025-11.
These timestamps can reflect imports or batch creation and exclude deleted
documents, so they are not used as historical upload or contributor totals.

## Media optimization evidence

```text
Metric: original media population
Exact definition: all regular readable JPEG/PNG files recursively present under public/plantspic
Value: 1,033 files; 2,109,916,481 bytes; average 2,042,513.53 bytes; median 2,199,452 bytes; 57 JPEG and 976 PNG
Time window: point-in-time before and after additive variant backfill
Source: production media filesystem
Query/calculation: full recursive stat plus Sharp metadata inspection
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct filesystem population
Limitations: files are not proven unique photographs and can include unreferenced or archived media
```

```text
Metric: responsive WebP derivative coverage and size reduction
Exact definition: exact basename pairs between every original and each versioned WebP width; reduction is 100 * (sum original bytes - sum derivative bytes) / sum original bytes
Value: 3,099/3,099 derivatives created, 0 failures, 100% coverage at each width. 480 px: 27,799,366 bytes, median 22,712, 98.68% aggregate reduction. 960 px: 73,519,304 bytes, median 54,176, 96.52% reduction. 1600 px: 135,733,456 bytes, median 92,174, 93.57% reduction. Total derivative storage: 237,052,126 bytes
Time window: production backfill completed 2026-07-22T17:22:30Z; post-check 2026-07-22T17:23:32Z
Source: production media filesystem
Query/calculation: full 1,033-file pairing for each width using scripts/collect-media-metrics.js
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct full-population byte calculation
Limitations: byte reduction is against originals at each width; a browser downloads one selected candidate, so reductions across widths must not be added together; a five-file size-stratified visual smoke check found no obvious rendering defect but is not an exhaustive perceptual-quality score
```

Existing legacy compressed media covered only 191 exact pairs (18.49% of
original files). Across those pairs it reduced aggregate bytes by 68.70%.
Responsive variants preserve originals, use deterministic versioned URLs,
resize without enlargement, and are never overwritten by the backfill.

## Qualitative and unavailable evidence

The public product description supports the purpose: documenting campus
species, searchable multilingual information cards, seasonal photography,
creative work, and educational material. It does not independently prove a
specific school-club participant count, event attendance, or organization
workflow headcount.

Still unavailable and excluded from CV claims:

- verified unique visitors, valid visits, active users, and monthly active
  contributors;
- historical search count, search success rate, and zero-result rate before
  telemetry;
- exact first launch, continuous service, uptime percentage, downtime, MTTR,
  and complete deployment count;
- verified contributor/organization headcount and consented quotations;
- staging parity and successful recovery rehearsal, which were explicitly
  deferred for this work.
