# Metric catalog and evidence status

This catalog makes the requested evidence durable before new telemetry changes
the product. Every future measurement must use the evidence-record template in
[collection-method.md](collection-method.md).

## Six priority metrics

| Metric                                                         | Current value                                                                                                | Evidence status         | Limitation                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------------------------- |
| Public operation lower bound                                   | Public snapshot on 2024-01-15; observed again on 2026-07-22                                                  | Direct for observations | Does not prove continuous service or uptime                               |
| Valid visits/sessions                                          | Unavailable; 96,307 strict session candidates retained as a low-confidence proxy                             | Unavailable/proxy       | Upstream proxy address semantics prevent promotion to valid visits        |
| Verified unique visitors                                       | Unavailable                                                                                                  | Unavailable             | No identity-preserving, consented analytics source exists                 |
| Current plant records                                          | 152 authorized; 153 total including 1 pending                                                                | Direct                  | Does not include deleted history                                          |
| Current image/works documents                                  | 970 Pic, 27 Art, and 18 approved creation documents                                                          | Direct                  | Not a unique-image or upload count                                        |
| Real searches, edits, uploads, contributor or organization use | 964 filtered 2xx write/review/delete endpoint responses; historical searches and verified people unavailable | Proxy/Unavailable       | Responses can include repeated tests and are not people or unique actions |

## Lifecycle and deployment

| Metric                                | Current value                                                             | Status                  | Source and limitation                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| First public launch date              | Unavailable                                                               | Unavailable             | Earliest retained public snapshot is only a lower bound                                                      |
| Earliest public snapshot              | 2024-01-15                                                                | Direct                  | Internet Archive retained-snapshot record                                                                    |
| Domain registration date              | 2023-10-12                                                                | Direct                  | Public RDAP registration event                                                                               |
| Current deployed commit               | 6c9bfb7                                                                   | Direct                  | Protected production cutover recorded in phase-11 report; previous ea471b6 retained for rollback             |
| Current deployment date               | 2026-07-22                                                                | Direct for this cutover | Server-side deployment marker and post-deploy health checks; historical deployment count remains unavailable |
| Continuous service duration           | Unavailable                                                               | Unavailable             | No availability monitor or complete incident history                                                         |
| Interrupted-service periods           | Unavailable                                                               | Unavailable             | No verified incident timeline                                                                                |
| Major versions/features               | Partially available in Git history                                        | Proxy                   | Requires a reviewed release timeline                                                                         |
| Total deployments/recent deployment   | Unavailable / candidate above                                             | Unavailable             | Git pull and process dates cannot establish all deployments                                                  |
| Server/platform migrations            | Unavailable                                                               | Unavailable             | Needs configuration/history evidence                                                                         |
| Incidents and recovery times          | Unavailable                                                               | Unavailable             | Logs are not classified incidents                                                                            |
| Production/staging/local relationship | Production and local release commit 6c9bfb7; no independent staging found | Direct/partial          | Isolated release smoke passed; staging parity and restore rehearsal remain unavailable                       |

## Traffic and audience

| Metric                                 | Current value                                                                                                              | Status            | Source and limitation                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Earlier unfiltered access-log snapshot | 1,131,459                                                                                                                  | Direct            | Earlier 2026-07-22 snapshot retained for chronology; superseded by the later collection below and not visits   |
| Pageviews                              | Unavailable                                                                                                                | Unavailable       | SPA navigation and filtering are not captured defensibly                                                       |
| Visits/sessions                        | Unavailable; 96,307 strict 30-minute session candidates are retained as a low-confidence proxy                             | Unavailable/proxy | Aggregation is chronologically bounded, but upstream proxy address semantics prevent promotion to valid visits |
| Verified unique visitors               | Unavailable                                                                                                                | Unavailable       | No suitable first-party identity source                                                                        |
| Recent 30/90/365-day traffic           | 5,708 / 21,989 / 126,753 strict recognized-route requests; 1,802 / 6,398 / 23,215 2xx document-load candidates             | Proxy             | Server-visible request proxies, not visits/pageviews                                                           |
| Monthly/daily averages and trend       | Full monthly strict trend retained; all-period average 289.13 requests and 59.38 document-load candidates per calendar day | Proxy             | Retention and SPA/proxy limitations apply                                                                      |
| Peak daily/hourly traffic              | 1,153 strict requests on 2026-02-18; 392 in 2025-09-02T18:00Z                                                              | Proxy             | Operational request peaks, not visitor peaks                                                                   |
| New/returning share                    | Unavailable                                                                                                                | Unavailable       | No consented visitor identity source                                                                           |
| Visit duration/pages/bounce rate       | Unavailable                                                                                                                | Unavailable       | Nginx alone cannot observe SPA completion or duration                                                          |
| Source and device distribution         | Aggregate request-category shares available                                                                                | Proxy             | Request shares only; geography remains unavailable                                                             |
| Most visited pages                     | Home is the highest strict route category                                                                                  | Proxy             | Route request count includes redirects and is not a pageview count                                             |
| HTTP request total                     | 1,131,690 retained frontend access-log entries at collection                                                               | Direct            | Operational request volume only; never label as visits                                                         |

## Product usage and contribution

| Metric                                                 | Current value                                                                   | Status            | Source and limitation                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------ |
| Authorized plant records                               | 152                                                                             | Direct            | Current MongoDB posts with authorization true                                        |
| Pending plant records                                  | 1                                                                               | Direct            | Current MongoDB posts not authorized                                                 |
| Historical records created                             | Unavailable; current-document ObjectId month cohorts retained as a proxy        | Unavailable/proxy | Deleted records and import semantics are not recoverable                             |
| Pic documents                                          | 970                                                                             | Direct            | Current MongoDB Pic collection                                                       |
| Art documents                                          | 27                                                                              | Direct            | Current MongoDB Art collection                                                       |
| Media filesystem footprint                             | 1,245 files / 2,332,435,708 bytes                                               | Direct            | Pre-deploy point-in-time snapshot; includes non-record files and derivatives         |
| Current registered accounts                            | 3                                                                               | Direct            | Current MongoDB user documents; not active users                                     |
| Searches, success rate, zero-result rate, language use | Unavailable                                                                     | Unavailable       | Index API responses are not searches; search telemetry contains zero retained events |
| Detail views, uploads, creates, edits, reviews         | 1,538 plant-detail API responses and 964 write/review/delete endpoint responses | Proxy             | 2xx responses can include repeated tests and are not unique actions                  |
| Actual contributors and monthly active contributors    | Unavailable; 29 current attribution labels                                      | Unavailable/proxy | Labels do not verify distinct people or activity                                     |
| Browser/contributor ratio                              | Unavailable                                                                     | Unavailable       | Requires both traffic and auditable contribution events                              |
| Organization workflows and feedback                    | Unavailable                                                                     | Unavailable       | Needs consented, reviewed qualitative evidence                                       |
| Core versus unused functions                           | Unavailable                                                                     | Unavailable       | Needs audited usage events and qualitative review                                    |

## Reliability, media, search, and engineering

| Metric                                              | Current value                                                                                 | Status         | Source and limitation                                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| Point-in-time public HTTPS                          | HTTP 200                                                                                      | Direct         | Observed for root, `/api/health/live`, and `/api/searchNames` after protected cutover                 |
| Uptime/availability/downtime/MTTR                   | Unavailable                                                                                   | Unavailable    | No historical monitor coverage                                                                        |
| HTTP error rate / unhandled exceptions              | 42 5xx among 182,149 strict recognized-route requests in retained logs                        | Proxy          | Filtered request share only, not whole-service error rate; exceptions remain unavailable              |
| p50/p95/p99, search, upload, database latency       | Unavailable                                                                                   | Unavailable    | No latency telemetry                                                                                  |
| CPU/memory/disk state                               | Point-in-time baseline collected privately                                                    | Direct         | Not a capacity trend or performance claim                                                             |
| TLS validity                                        | 2026-02-25 through 2027-02-25                                                                 | Direct         | Certificate dates only                                                                                |
| Automated restart/health/alerting                   | Liveness/readiness endpoints exist; historical monitor coverage unavailable                   | Direct/partial | Process management is observed; external monitoring and alert coverage are not verified               |
| Backup restore success                              | Unavailable                                                                                   | Unavailable    | Presence of backup files is not a restore test                                                        |
| Pic/Art path existence                              | 997 of 997 document paths present                                                             | Direct         | Does not prove visual validity or unique physical files                                               |
| Average size, compression ratio, storage saved      | Full-population original and 480/960/1600 variant metrics measured                            | Direct         | See CV impact report; reductions are width-specific and cannot be summed                              |
| Image format/limit/process failure rate             | JPEG/PNG/WebP inputs; 20 MB/file and 20 files/request; 3,099/3,099 backfill outputs succeeded | Direct/partial | Backfill failure rate is direct; ongoing upload-processing failure rate needs telemetry               |
| Multilingual/fuzzy search quality and index latency | Implementation exists; quality metric unavailable                                             | Partial        | Requires a test corpus and measured queries                                                           |
| Architecture/API/schema/auth model                  | Source-reviewed baseline available                                                            | Direct/partial | Must be kept current as modules move                                                                  |
| Test coverage/CI/security scan                      | Focused tests and CI workflow present; numeric coverage unavailable                           | Partial        | CI configuration is committed; hosted-run history and dependency scan results still need verification |

## Guardrails for future reporting

- Never call registered accounts active users.
- Never call access-log requests visits, sessions, pageviews, or unique people.
- Never infer historical uptime from a start date, a Git commit, or a current
  healthy response.
- Never claim image compression, performance, or reliability improvements
  without a comparable pre/post method and recorded sample or population.
- Never publish names, accounts, IP addresses, raw user feedback, or private
  operational configuration without explicit permission.
