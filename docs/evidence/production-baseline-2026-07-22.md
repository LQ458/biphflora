# Production baseline — 2026-07-22

Collection time: 2026-07-22T07:00:56Z.

This is a point-in-time, read-only production baseline. It is not an uptime
report, a traffic report, or a backup-restore certification.

## Verified current state

| Area | Direct observation | Important limitation |
| --- | --- | --- |
| Deployed source | Commit ea471b6; production checkout is detached | A matching Git commit does not prove every historical deployment |
| Application listeners | Frontend on port 3000 and backend on port 3001 were present | Direct listeners may bypass Nginx and are not a traffic source of record |
| Core services | Nginx, MongoDB, and Redis were active at collection time | This is a point-in-time health observation, not availability |
| Public HTTPS | The public home page returned HTTP 200 after the audit | The application has no dedicated health endpoint yet |
| Plant data | 153 current plant documents: 152 authorized and 1 pending | Current documents exclude deleted historical records |
| Bird data | 0 current bird documents | This does not establish whether bird features were historically used |
| Images and artwork | 970 current Pic documents and 27 current Art documents | Documents are not proven to be unique physical images |
| Media references | All 970 Pic paths and all 27 Art paths mapped to an existing file | This checks existence only; it does not detect duplicate file references or visual correctness |
| Media filesystem | 1,245 files using 2,332,361,589 bytes | Includes originals, derivatives, uploads, assets, and possible archives |
| Media subdirectories | Originals: 1,033 files / 2,109,916,481 bytes; derivatives: 196 / 41,024,169 bytes; uploads: 2 / 6,811,922 bytes | The three folders do not account for every file below public |
| MongoDB logical data | 14 collections; 597,225 data bytes; 741,376 storage bytes; 589,824 index bytes | Separate from media files and MongoDB engine files |
| Redis | 2 keys; RDB persistence enabled, AOF disabled; last RDB save reported successful | Key count is not a session, user, or cache metric |
| Access-log evidence | 1,131,038 unfiltered frontend access-log entries from 2024-10-31 through 2026-07-22 | Entries include requests that may be assets, bots, scans, or internal traffic; they are not visits or users |
| Backups | 151 panel-backup files and 1 root-level database-backup candidate were observed | Scope, retention, restore success, and media/Redis coverage remain unverified |
| TLS | Certificate validity observed from 2026-02-25 through 2027-02-25 | Certificate validity does not prove endpoint availability |

## Lifecycle evidence

Metric: Domain registration date

Exact definition: Registration timestamp returned by the public registry record
for the production domain.

Value: 2023-10-12T13:35:34Z

Time window: Domain registration event.

Source: Verisign RDAP, collected during the baseline research.

Query/calculation: Public RDAP registration-event field.

Bot/internal-traffic filtering: Not applicable.

Collected on: 2026-07-22.

Confidence: Direct for the registry event.

Limitations: A registration date is not a launch date.

Metric: Earliest currently verified public page snapshot

Exact definition: Earliest retained successful HTML snapshot returned by the
Internet Archive query used for this audit.

Value: 2024-01-15.

Time window: Retained public snapshots available to the query.

Source: Internet Archive CDX.

Query/calculation: Successful HTML snapshots for the production root URL,
collapsed by digest.

Bot/internal-traffic filtering: Not applicable.

Collected on: 2026-07-22.

Confidence: Direct for the retained snapshot record.

Limitations: It is a lower bound for public visibility, not proof of the first
launch, continuous service, or uptime.

Metric: Current deployment candidate

Exact definition: Most recent Git reflog entry matching a pull from the main
branch in the active production checkout.

Value: 2025-12-19T13:10:32+08:00.

Time window: Current checkout reflog retained on the host.

Source: Production Git reflog.

Query/calculation: First matching pull-origin-main reflog record.

Bot/internal-traffic filtering: Not applicable.

Collected on: 2026-07-22.

Confidence: Candidate.

Limitations: A Git pull does not prove a completed application build, process
restart, or user-visible deployment. Total deployment count remains unavailable.

## Operational finding

An empty PM2 daemon created during the initial read-only inspection was
rechecked before cleanup. It reported zero managed applications and was
subsequently absent. The application listener PIDs stayed unchanged; Nginx,
MongoDB, Redis, and public HTTPS remained healthy. No application process,
database record, media file, Nginx configuration, or deployment was changed.

## Explicitly unavailable claims

- Historical uptime, availability percentage, downtime total, incident count,
  recovery time, and latency percentiles.
- Valid visits/sessions, verified unique visitors, pageviews, source mix,
  device mix, geography, bounce rate, pages per visit, and visit duration.
- Historical searches, successful searches, zero-result searches, uploads,
  edits, approvals, account activity, and real contributor counts.
- Average image size, compression ratio, storage savings, image-processing
  failure rate, search latency, cache-hit rate, database latency, and capacity
  trends.
- A verified backup restore, staging parity, or end-to-end recovery test.

These fields remain unavailable until instrumentation or a defensible
server-side aggregation produces a documented value.
