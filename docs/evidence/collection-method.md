# Evidence collection method

## Collection principles

1. Treat MongoDB, filesystem media, Redis, logs, deployment metadata, backups,
   TLS/DNS, and qualitative evidence as separate sources of truth.
2. Prefer read-only aggregation on the production host. Do not copy raw access
   logs, media files, database dumps, credentials, tokens, or user records to
   the repository.
3. Record a source's grain before interpreting it. For example, an Nginx log
   entry is a request, not a session or a verified human.
4. Preserve the exact calculation and collection date for every number.
5. Mark missing evidence as unavailable rather than estimating a favorable
   value.

## Current source-to-metric mapping

| Source class | Safe aggregate use | Not safe to infer |
| --- | --- | --- |
| MongoDB collections | Current document counts, authorization state, ObjectId bounds, logical database size | Deleted historical records, active users, completed workflows without audit events |
| Media filesystem | File count, byte totals, existence of a path referenced by a document | Unique image count, image quality, compression rate, successful upload count |
| Redis | Current key count and persistence mode | Session count, user count, cache-hit rate |
| Nginx access log | Unfiltered request-entry range and later filtered request/session estimates | Verified unique people, client-side SPA behavior, uptime |
| Application logs | Log retention range and aggregated error candidates | Error rate or incident history without a denominator and classification |
| Git/reflog/process metadata | Current deployed commit and deployment candidates | Total deployment count or a successful deployment by itself |
| Backup directories | Presence, age, and aggregate file metadata | Recoverability or coverage until a restore test proves it |
| RDAP, DNS, TLS, Wayback | Registration, certificate, and publicly observable history | Continuous availability or internal launch date |

## Traffic calculation rule

Traffic aggregation retains the source log on the server and saves only
aggregates. The strict audience-oriented view keeps fixed recognized product
routes and separately excludes unrecognized routes; the broad view is retained
only as an operational request diagnostic. A candidate session is a sequence
of included requests sharing a privacy-preserving signature with no more than
30 minutes of inactivity. Exclude static assets, health checks, recognized
bots/crawlers, obvious scanners, known internal testing, administration routes,
and anomalous refresh bursts. A signature produced from IP and user-agent is an
estimated visitor signature, never a verified unique visitor.

If public traffic traverses a proxy/CDN and the origin log does not contain a
verified restored client address, signature and session metrics remain low
confidence even after filtering. Successful fixed endpoint responses may be
reported as HTTP response evidence, but not as people or unique business
actions. Index API responses are not searches.

## Media calculation rule

Before a media optimization or cleanup:

1. Generate a file manifest with relative paths, byte sizes, and checksums.
2. Compare each MongoDB path reference to the original and derivative files.
3. Classify unmatched, duplicated, and unreferenced files without deleting any.
4. Calculate original and derivative size distributions only from a documented
   matched sample or full matched population.
5. Require a verified backup, dry-run manifest, and isolated staging sample
   before overwriting/deleting media or changing path references. An additive,
   no-overwrite derivative job may proceed after local fixture tests, a full
   dry run, capacity checks, and an existing media rollback artifact, while the
   missing staging/recovery rehearsal remains an explicit risk.

The 2026-07-23 derivative rollout was additive: it wrote only new versioned
paths, did not overwrite originals or existing derivatives, and retained a
dry-run aggregate plus full post-write pairing metrics. A width-specific byte
reduction compares one derivative population with the same original
population; reductions from multiple widths are never added together.

## Evidence record template

Metric:

Exact definition:

Value:

Time window:

Source:

Query/calculation:

Bot/internal-traffic filtering:

Collected on:

Confidence:

Limitations:
