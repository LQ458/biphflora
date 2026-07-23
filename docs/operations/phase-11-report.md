# Phase 11 report — protected cloud deployment and verification

Date: 2026-07-22

## What changed

- Deployed local commit `6c9bfb7` (`6c9bfb77528f3b4341c01088d4df4355d2c91a2a`)
  to the production application directory, replacing the previous deployed
  commit `ea471b6`.
- Replaced the backend runtime dependencies from the isolated release
  installation and swapped the client `build` directory. The production
  `.env`, `public` media directory, client public assets, Nginx configuration,
  and pre-existing untracked files were left in place.
- Added a timestamped, server-side rollback point at
  `/www/backup/biphflora-predeploy-20260722T105508Z`. It contains the previous
  source archive, untracked files, environment-file copy, media archive,
  MongoDB logical dump, Redis RDB (when present), Nginx configuration, log
  cutoff, old `node_modules`, and old client build directory.

## Pre-deploy protection and isolated verification

- Backup result: `backup_created`, 11 top-level files, 2,610,226,184 bytes;
  the recorded checksum checks had zero failures.
- MongoDB logical dump completed successfully; Redis RDB was present. No
  restore rehearsal was performed, so this is a rollback artifact, not a
  recovery certification.
- The release was unpacked at `/www/wwwroot/biphflora-releases/6c9bfb7`,
  installed with the server Node runtime, syntax-checked, loaded without
  listening, and started temporarily on port 3101 with the production
  dependency endpoints. `/health/live` and `/health/ready` both passed, with
  MongoDB and Redis reported ready. The temporary process was stopped.
- No independent staging environment exists; this was an isolated release
  smoke check, not staging parity or a restore test.

## Production verification

- The backend was stopped and restarted using the existing `npm run start`
  / nodemon launch path. A controlled restart therefore occurred; its exact
  interruption duration was not instrumented and is not claimed as zero.
- Direct backend checks returned JSON 200 for `/health/live` and
  `/health/ready`; the readiness response reported MongoDB and Redis ready.
- Public HTTPS checks returned 200 for `/`, `/api/health/live`, and
  `/api/searchNames`. `nginx -t` passed; no Nginx reload or configuration edit
  was performed.
- The frontend static process remained running and served the new build asset.
- A read-only sample path returned by `/api/getDb2Pic` successfully served one
  compressed media byte over public HTTPS. The media directory was not changed
  or backfilled.
- Existing MongoDB counts remained 153 posts (152 authorized, 1 pending),
  970 Pic documents, 27 Art documents, 3 users, and 0 bird posts. The new
  code caused empty `audit_events` and `search_events` collections to exist;
  no audit or search event documents were written by the checks.
- Redis remained reachable with two keys at the verification point. No
  session or token values were recorded.

## Production impact

- One controlled backend process restart and one client build-directory swap
  occurred. Nginx, MongoDB, Redis, the media tree, and environment values were
  not intentionally changed.
- Existing API/database contracts were not migrated. The additive empty event
  collections are a schema-side effect of Mongoose model initialization and
  require observation before enabling event collection in production.
- No user-facing regression was observed in the health, search, homepage, or
  static-build checks. This does not replace an end-to-end authenticated upload,
  edit, approval, or deletion test.

## Remaining risks

- There is still no independent staging environment or successful restore
  rehearsal. The backup artifacts have not been restored into an isolated
  MongoDB/media environment.
- Historical uptime, valid visits/sessions, verified unique visitors, search
  success rates, latency percentiles, and contributor counts remain
  unavailable until documented server-side aggregation or reliable monitoring
  exists.
- The full CRA development dependency tree and existing CRA/ESLint/CSS build
  warnings remain. Production dependency audits are documented separately.
- The Nginx file still contains a stale filesystem `root` path while the
  frontend proxy is serving correctly; correcting it requires a separate
  Nginx approval. The frontend/backend processes are not represented by a
  verified systemd unit.
- SSH access intermittently closed during banner exchange after deployment;
  no firewall or SSH setting was changed. Server-side SSH/fail2ban logs need a
  separate read-only review when a stable session is available.

## Rollback

1. Confirm the current process command and stop only the BiphFlora backend
   launch tree.
2. Restore the previous source from
   `production-source-ea471b695dac502ede06b0f77ecbd56d1efd785a.tar.gz` or the
   recorded pre-deploy checkout, and move the saved
   `node_modules-predeploy` back into the application directory.
3. Restore `client-build-predeploy-dir` as `client/build`.
4. Preserve `.env`, `public`, and existing untracked files; do not restore a
   database or media archive unless a separate recovery decision requires it.
5. Start the existing launch command, check direct and public health/search,
   and record the old/new process times. Nginx rollback is not required for
   this release because its configuration was not changed.

No push, pull request, database migration, media backfill, backup deletion, or
Git history rewrite was performed.
