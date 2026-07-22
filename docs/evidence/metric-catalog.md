# Metric catalog and evidence status

This catalog makes the requested evidence durable before new telemetry changes
the product. Every future measurement must use the evidence-record template in
[collection-method.md](collection-method.md).

## Six priority metrics

| Metric | Current value | Evidence status | Limitation |
| --- | --- | --- | --- |
| Public operation lower bound | Public snapshot on 2024-01-15; observed again on 2026-07-22 | Direct for observations | Does not prove continuous service or uptime |
| Valid visits/sessions | Unavailable | Unavailable | Requires server-side filtered aggregation with a retained rule version |
| Verified unique visitors | Unavailable | Unavailable | No identity-preserving, consented analytics source exists |
| Current plant records | 152 authorized; 153 total including 1 pending | Direct | Does not include deleted history |
| Current image/works documents | 970 Pic and 27 Art documents | Direct | Not a unique-image count |
| Real searches, edits, uploads, contributor or organization use | Unavailable | Unavailable | Existing data lacks an append-only event/audit source and consented qualitative evidence |

## Lifecycle and deployment

| Metric | Current value | Status | Source and limitation |
| --- | --- | --- | --- |
| First public launch date | Unavailable | Unavailable | Earliest retained public snapshot is only a lower bound |
| Earliest public snapshot | 2024-01-15 | Direct | Internet Archive retained-snapshot record |
| Domain registration date | 2023-10-12 | Direct | Public RDAP registration event |
| Current deployed commit | ea471b6 | Direct | Production Git checkout at collection time |
| Current deployment date | 2025-12-19 candidate | Candidate | Latest retained pull-origin-main reflog entry; not a completed deployment proof |
| Continuous service duration | Unavailable | Unavailable | No availability monitor or complete incident history |
| Interrupted-service periods | Unavailable | Unavailable | No verified incident timeline |
| Major versions/features | Partially available in Git history | Proxy | Requires a reviewed release timeline |
| Total deployments/recent deployment | Unavailable / candidate above | Unavailable | Git pull and process dates cannot establish all deployments |
| Server/platform migrations | Unavailable | Unavailable | Needs configuration/history evidence |
| Incidents and recovery times | Unavailable | Unavailable | Logs are not classified incidents |
| Production/staging/local relationship | Production and local commit observed; no staging found | Direct/partial | Need isolated staging before deployment approval |

## Traffic and audience

| Metric | Current value | Status | Source and limitation |
| --- | --- | --- | --- |
| Unfiltered access-log entries | 1,131,038 | Direct | Request entries from 2024-10-31 to 2026-07-22; not visits |
| Pageviews | Unavailable | Unavailable | SPA navigation and filtering are not captured defensibly |
| Visits/sessions | Unavailable | Unavailable | Requires documented 30-minute session aggregation |
| Verified unique visitors | Unavailable | Unavailable | No suitable first-party identity source |
| Recent 30/90/365-day traffic | Unavailable | Unavailable | Pending approved log aggregation |
| Monthly/daily averages and trend | Unavailable | Unavailable | Pending approved log aggregation |
| Peak daily/hourly traffic | Unavailable | Unavailable | Pending approved log aggregation |
| New/returning share | Unavailable | Unavailable | No consented visitor identity source |
| Visit duration/pages/bounce rate | Unavailable | Unavailable | Nginx alone cannot observe SPA completion or duration |
| Source, device, country distribution | Unavailable | Unavailable | Needs filtered, privacy-preserving aggregation |
| Most visited pages | Unavailable | Unavailable | Needs route-level aggregation and SPA caveat |
| HTTP request total | 1,131,038 frontend access-log entries | Direct | Operational request volume only; never label as visits |

## Product usage and contribution

| Metric | Current value | Status | Source and limitation |
| --- | --- | --- | --- |
| Authorized plant records | 152 | Direct | Current MongoDB posts with authorization true |
| Pending plant records | 1 | Direct | Current MongoDB posts not authorized |
| Historical records created | Unavailable | Unavailable | Deleted documents are not recoverable from current collections |
| Pic documents | 970 | Direct | Current MongoDB Pic collection |
| Art documents | 27 | Direct | Current MongoDB Art collection |
| Media filesystem footprint | 1,245 files / 2,332,361,589 bytes | Direct | Includes non-record files and derivatives |
| Current registered accounts | 3 | Direct | Current MongoDB user documents; not active users |
| Searches, success rate, zero-result rate, language use | Unavailable | Unavailable | Aggregate search telemetry exists but is disabled by default; no historical events have been verified |
| Detail views, uploads, creates, edits, reviews | Unavailable | Unavailable | Append-only audit path exists but is disabled by default; no historical events have been verified |
| Actual contributors and monthly active contributors | Unavailable | Unavailable | Account/editor fields do not verify distinct people or activity |
| Browser/contributor ratio | Unavailable | Unavailable | Requires both traffic and auditable contribution events |
| Organization workflows and feedback | Unavailable | Unavailable | Needs consented, reviewed qualitative evidence |
| Core versus unused functions | Unavailable | Unavailable | Needs audited usage events and qualitative review |

## Reliability, media, search, and engineering

| Metric | Current value | Status | Source and limitation |
| --- | --- | --- | --- |
| Point-in-time public HTTPS | HTTP 200 | Direct | Observed after the stage-0 audit only |
| Uptime/availability/downtime/MTTR | Unavailable | Unavailable | No historical monitor coverage |
| HTTP error rate / unhandled exceptions | Unavailable | Unavailable | Need classified status/error aggregation |
| p50/p95/p99, search, upload, database latency | Unavailable | Unavailable | No latency telemetry |
| CPU/memory/disk state | Point-in-time baseline collected privately | Direct | Not a capacity trend or performance claim |
| TLS validity | 2026-02-25 through 2027-02-25 | Direct | Certificate dates only |
| Automated restart/health/alerting | Liveness/readiness endpoints exist; historical monitor coverage unavailable | Direct/partial | Process management is observed; external monitoring and alert coverage are not verified |
| Backup restore success | Unavailable | Unavailable | Presence of backup files is not a restore test |
| Pic/Art path existence | 997 of 997 document paths present | Direct | Does not prove visual validity or unique physical files |
| Average size, compression ratio, storage saved | Unavailable | Unavailable | Requires matched original/derivative analysis |
| Image format/limit/process failure rate | Unavailable | Unavailable | Need validated server rules and operation telemetry |
| Multilingual/fuzzy search quality and index latency | Implementation exists; quality metric unavailable | Partial | Requires a test corpus and measured queries |
| Architecture/API/schema/auth model | Source-reviewed baseline available | Direct/partial | Must be kept current as modules move |
| Test coverage/CI/security scan | Focused tests and CI workflow present; numeric coverage unavailable | Partial | CI configuration is committed; hosted-run history and dependency scan results still need verification |

## Guardrails for future reporting

- Never call registered accounts active users.
- Never call access-log requests visits, sessions, pageviews, or unique people.
- Never infer historical uptime from a start date, a Git commit, or a current
  healthy response.
- Never claim image compression, performance, or reliability improvements
  without a comparable pre/post method and recorded sample or population.
- Never publish names, accounts, IP addresses, raw user feedback, or private
  operational configuration without explicit permission.
