# Deployment readiness and rollback

This is a preparation checklist, not a production runbook authorization. The current repository has no verified staging environment, so a release may be described as deployable only after local checks and an isolated staging or equivalent fixture run; production must not substitute for staging.

## Before a release

- Record the old and candidate Git commits and the build timestamp.
- Run `npm run verify` and capture the exact result.
- Back up and verify, separately: a MongoDB logical dump; a media file manifest plus snapshot; `.env` and secret-store references; Nginx/宝塔 configuration; required Redis persistence state; and the access/error-log metric cutoff.
- Confirm the backup locations, retention policy, and a restore test or clearly mark restore as unverified.
- Review API compatibility, authorization tests, upload limits, media path references, and the phase report.
- Do not run `git clean`, overwrite `public`, replace `.env`, or copy production data into local fixtures.

## Staging or isolated fixture checks

Use anonymous records and synthetic media only. Exercise MongoDB readiness, Redis session behavior, catalog/search, login, upload rejection and cleanup, edit/review authorization, image fallback, and rollback to the previous build. Compare URL paths, request bodies, success responses, record counts, and database-to-media references before and after.

## Production steps requiring separate approval

Deploy one phase commit at a time. Record old/new commit, dependency installation result, build time, process start time, health checks, HTTP status/error observations, downtime, and regressions. Database migrations, media backfills, Nginx reloads, service restarts, and Redis restoration are separate approvals; none are implied by a code commit.

## Rollback order

1. Stop routing the candidate build and restore the last recorded application build/commit.
2. Restore dependency state if it changed and perform the authorized process restart.
3. If configuration changed, restore the Nginx/宝塔 backup, run `nginx -t`, then reload with authorization.
4. If data changed, restore the affected MongoDB collection or full dump and verify counts and references.
5. If media references changed, restore the media snapshot or old path references. Do not delete new derivatives until their dependency and reference status is reviewed.
6. Prefer session expiry and re-login after a Redis rollback; restore a Redis snapshot only when session preservation is explicitly required.

Record whether there was downtime, whether any requests regressed, and which evidence was unavailable. Never claim a successful recovery without a completed health check and data/reference comparison.
