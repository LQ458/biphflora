# Phase 12 report — responsive media, evidence, and production acceptance

Date: 2026-07-23

> Post-release correction: the first responsive-media frontend build omitted
> its production API prefix and was rolled back after a browser runtime failure.
> Release `4168079` corrects the issue. See `phase-13-report.md` for the incident,
> recovery, browser verification, and current production status.

## Release and Git record

Production code release: `5e8919a`

The release is composed of ordinary repository commits:

- `fecb467` — `perf: add responsive media delivery`
- `b729394` — `chore: add privacy-safe evidence collectors`
- `5e8919a` — `docs: record verified product impact`

The branch is `refactor/progressive-stability`. No push, pull request, Git
history rewrite, database migration, Nginx change, or credential change was
performed. The production application keeps an explicit deployed-commit marker
because its historical `.git` metadata is not treated as deployment evidence.
That historical server worktree remains on its old HEAD with a release overlay
and is intentionally not claimed as Git-clean; changing it would risk
unreviewed tracked or untracked production data. The authoritative local branch
and commit metadata passed the clean-worktree gate.

## What changed

- Added versioned 480, 960, and 1600 pixel WebP derivatives while preserving
  every original and all legacy media URLs.
- Added browser `srcset`, `sizes`, lazy loading, asynchronous decoding, explicit
  dimensions, legacy fallbacks, and eager loading only for the primary landing
  image.
- Added bounded image processing, atomic no-overwrite publication, path
  validation, graceful queue draining, and a shared serial boundary for
  generate, delete, and rename operations.
- Added a dry-run-first media backfill and aggregate-only media, traffic, and
  product evidence collectors.
- Added redacted CV, traffic, metric-method, and image-delivery reports. Raw
  logs, addresses, user agents, account data, filenames, and credentials stayed
  on the production host.

## Production media result

- Original population: 1,033 readable JPEG/PNG files, 2,109,916,481 bytes.
- Backfill: 3,099 of 3,099 derivatives created with zero failures and no
  original replacement.
- 480 px: 27,799,366 bytes, 98.68% aggregate reduction versus paired originals.
- 960 px: 73,519,304 bytes, 96.52% aggregate reduction.
- 1600 px: 135,733,456 bytes, 93.57% aggregate reduction.
- Total additive derivative storage: 237,052,126 bytes.
- A five-file, size-stratified visual smoke check at 480 and 1600 px found no
  obvious decode, rotation, crop, severe artifact, or colour problem. This is
  not an exhaustive perceptual-quality score.

Public delivery returned `200 image/webp` through the production `/api` proxy
and advertised `Cache-Control: public, max-age=31536000, immutable`. Direct
backend delivery returned the same image type. The first acceptance script
tested the unproxied browser path and therefore produced a false failure; the
corrected public-path check passed and is the recorded gate.

## Evidence result

The complete CV-safe evidence is in
`docs/evidence/cv-impact-report-2026-07-23.md`, with the detailed monthly and
endpoint tables in `docs/evidence/traffic-report-2026-07-23.md`.

Key defensible values:

- Publicly observable lower bound: 919 days from 2024-01-15 through
  2026-07-22; this is not continuous uptime.
- Retained source volume: 1,131,690 Nginx log entries, of which 1,081,407
  parsed; HTTP requests are not visits.
- Strict recognized product-route traffic: 182,149 filtered requests and
  37,409 successful document-load candidates across the retained window.
- Recent strict traffic: 5,708 / 21,989 / 126,753 requests and
  1,802 / 6,398 / 23,215 document-load candidates over 30 / 90 / 365 days.
- Product workflow evidence: 4,049 fixed 2xx endpoint responses, including
  964 upload, edit, review, and deletion responses.
- Current product: 153 plants (152 approved, 1 pending), 970 picture
  documents, 27 artwork documents, 18 approved creation entries, and 3
  registered accounts.
- Current attribution: 29 labels, of which 1 matches a current account label;
  neither value is a verified contributor count.

Valid visits, verified unique visitors, active users, historical uptime,
historical search totals, and verified contributor or organisation headcounts
remain unavailable. Low-confidence session/signature proxies are retained only
with their limitations and must not be relabelled.

## Acceptance gates

| Gate | Result |
| --- | --- |
| Server marker, application source, and client build match release `5e8919a` | Pass |
| Backend and frontend each have one expected listener and application working directory | Pass |
| Public homepage | `200 text/html` |
| Public `/api/health/ready` with MongoDB and Redis ready | `200 application/json` |
| Approved plant catalogue | `200 application/json`, 152 entries |
| Read-only plant detail workflow | Pass |
| Unauthenticated administrator route | `401` |
| Public responsive image and immutable cache header | `200 image/webp`, pass |
| MongoDB counts after deployment | Unchanged: 153 / 152 / 1 plants, 0 birds, 970 Pic, 27 Art, 3 accounts |
| Media counts after deployment | Unchanged originals: 1,033; responsive derivatives: 3,099 |
| Nginx configuration syntax | Pass; no edit or reload |
| Recent backend fatal-pattern scan | 0 matches in the bounded tail |
| Local verification | 39 backend tests, 17 frontend tests, production build pass |

The server-side acceptance record is stored with the timestamped predeployment
backup. The old frontend build directory was moved into that backup after
acceptance. A pre-existing protected media archive in the application root was
preserved; it is not a release transfer artifact. Temporary evidence and visual
QA directories were removed, and no release-namespaced temporary item or build
switching directory remained in the active application tree.

## Production impact

- The backend received a controlled restart. The frontend process remained
  available while its build directory was switched.
- The exact backend interruption duration was not instrumented and is not
  claimed as zero. Public health remained available after the automatic
  rollback of the first attempt and passed after the final cutover.
- MongoDB, Redis, Nginx configuration, environment values, original media, and
  legacy media paths were not migrated or replaced.
- No regression was observed in homepage, readiness, catalogue, detail read,
  authorization rejection, or media delivery checks. Authenticated mutation
  flows were covered by local characterization tests rather than writes to
  production data.

## Remaining risks

- There is no independent staging environment and no completed restore
  rehearsal; recovery certification remains deferred.
- Historical valid visits, verified visitors, uptime, latency percentiles,
  active contributors, and organisation headcounts lack reliable evidence.
- The upstream proxy does not restore a verified client address at the origin,
  so session/signature calculations remain low-confidence proxies.
- Full development dependency audits still report 3 high-severity findings in
  the root tree and 54 client findings (13 low, 11 moderate, 27 high, 3
  critical). Production-only audits report zero known findings. No destructive
  automatic dependency upgrade was run.
- Existing CRA, Browserslist, ESLint, and CSS build warnings remain. They did
  not fail the production build, but should be removed through scoped upgrades
  and warning-by-warning fixes.
- The launch path still relies on the existing process-management arrangement;
  independent external monitoring and alert coverage are not verified.

## Deployment and rollback

The timestamped predeployment backup contains the previous source and client
build plus configuration and process records. The responsive release is also
retained in an isolated release directory.

Code rollback restores the previous source and saved build, preserves `.env`
and `public`, restarts only the backend launch tree, and re-runs direct and
public health/catalog/media checks. No MongoDB or media restore is needed for
this release because it introduced no schema migration and only added
derivatives; originals and legacy paths remain intact. Newly generated
derivatives can remain unused after a code rollback.
