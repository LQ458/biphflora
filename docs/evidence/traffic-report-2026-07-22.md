# BiphFlora data and traffic report — 2026-07-22

This is the current redacted report. It separates direct counts, operational
request proxies, candidates, and unavailable business metrics. Raw logs,
identifiers, credentials, database dumps, media files, and user feedback are
not copied here.

## Six priority metrics

```text
Metric: public operation lower bound
Exact definition: earliest retained successful public HTML snapshot
Value: 2024-01-15
Time window: retained Internet Archive snapshots
Source: Internet Archive CDX
Query/calculation: successful HTML root snapshots collapsed by digest
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: direct for the snapshot
Limitations: lower bound only; not launch date, continuous service, or uptime

Metric: valid visits/sessions
Exact definition: filtered 30-minute inactivity sessions
Value: unavailable
Time window: 2024-10-31 through 2026-07-22 logs exist, but no approved
server-side aggregation was completed for this report
Source: Nginx access logs
Query/calculation: not calculated
Bot/internal-traffic filtering: not calculated
Collected on: 2026-07-22
Confidence: unavailable
Limitations: request entries are not sessions

Metric: verified unique visitors
Exact definition: consented identity-backed distinct visitors
Value: unavailable
Time window: unavailable
Source: no verified identity analytics source
Query/calculation: not calculated
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: unavailable
Limitations: IP+UA signatures would only be estimated visitor signatures

Metric: current plant records
Exact definition: current MongoDB plant documents, split by authorization
Value: 152 authorized; 153 total including 1 pending
Time window: point-in-time baseline
Source: MongoDB Post collection
Query/calculation: aggregate current documents by authorization state
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: direct
Limitations: excludes deleted historical records

Metric: current image/work documents
Exact definition: current MongoDB Pic and Art documents
Value: 970 Pic; 27 Art
Time window: point-in-time baseline
Source: MongoDB Pic and Art collections
Query/calculation: current document counts
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: direct
Limitations: documents are not proven unique physical images

Metric: real searches/edits/uploads/contributors
Exact definition: completed user operations and distinct verified contributors
Value: unavailable
Time window: historical period
Source: no verified historical append-only event source or consented qualitative
evidence
Query/calculation: not calculated
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: unavailable
Limitations: registered accounts and editor fields are not active users or
verified contributors
```

## Traffic and access

```text
Metric: HTTP request entries
Exact definition: frontend Nginx access-log entries before business filtering
Value: 1,131,459
Time window: 2024-10-31 through the post-deploy verification on 2026-07-22
Source: production Nginx access logs
Query/calculation: counted retained frontend access-log entries after the
deployment checks
Bot/internal-traffic filtering: none; includes assets, bots, scans, health,
and internal/test traffic
Collected on: 2026-07-22
Confidence: direct for log-entry count
Limitations: must never be called pageviews, visits, sessions, or users
```

Pageviews, 30/90/365-day visits, monthly/daily averages, trends, peaks, new
versus returning visitors, duration, pages per visit, bounce rate, source mix,
device mix, country mix, and most visited pages remain unavailable. A
server-side aggregation must retain the exact 30-minute session rule and
exclusion list before any of these values can be reported.

## Product, media, and reliability evidence

- Current registered accounts: 3. This is an account count, not active users.
- Media filesystem: 1,245 mixed files using 2,332,435,708 bytes in the
  pre-deploy server snapshot. This includes originals, derivatives, uploads,
  assets, and possible archives; the deployment did not modify this tree.
- MongoDB Pic/Art path coverage: 997 of 997 document paths existed at baseline.
- Search result quality, search counts, success/zero-result rates, image
  processing failure rate, average sizes, compression ratio, and storage saved:
  unavailable without a retained event source or matched media analysis.
- Point-in-time public HTTPS: HTTP 200. This does not establish uptime.
- TLS validity observed: 2026-02-25 through 2027-02-25.
- Historical uptime, downtime, MTTR, error rate, latency percentiles, cache hit
  rate, backup recoverability, and restore-test success: unavailable.

## Engineering and deployment state

- Current production after the protected cutover: commit
  `6c9bfb77528f3b4341c01088d4df4355d2c91a2a` (`6c9bfb7`), with previous
  commit `ea471b6` retained in the rollback backup.
- Local verification: 24 backend tests and 15 frontend tests pass; production
  build succeeds with existing CRA/Browserslist/ESLint warnings.
- Root production dependency audit: 0 advisories after the native and
  transitive patch wave.
- Client production dependency audit with devDependencies omitted: 0
  advisories after the dependency boundary and overrides.
- Full client development-tree audit still reports CRA-related advisories; this
  report does not claim a CRA migration.
- No independent staging or restore rehearsal is verified. One controlled
  backend restart and client build swap occurred during deployment; no Nginx
  reload, data migration, or media backfill was performed. Empty additive
  `audit_events` and `search_events` collections exist after application
  startup, with zero event documents at verification.

The deployment and rollback evidence is recorded in
[phase-11-report.md](../operations/phase-11-report.md). The valid session,
verified visitor, and historical uptime fields remain `unavailable` rather
than being inferred from the request count.

The metric register in [metric-catalog.md](metric-catalog.md) and the method in
[collection-method.md](collection-method.md) are authoritative for definitions,
filtering, and limitations. The cloud access gate is recorded in
[phase-8-report.md](../operations/phase-8-report.md).
