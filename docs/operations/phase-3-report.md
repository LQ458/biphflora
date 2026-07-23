# Phase 3 report — incremental module boundaries

Date: 2026-07-22.

## What changed and why

- Moved token parsing, Redis-session validation, current-user lookup, and
  `requireAuth`/`requireAdmin` into `middleware/auth.js`. The Express entry
  point now composes those dependencies instead of owning the policy logic.
- Moved the contiguous public catalog lookup block into `routes/catalog.js`:
  `GET /searchNames`, `GET /searchBirdNames`, `POST /syncPlantInfo`,
  `POST /syncBirdInfo`, `GET /numOfPlants`, and `GET /numOfBirds`.
  The router is mounted at the former route position with no URL prefix.
- Moved the shared Axios defaults and request interceptor from `UserContext`
  into `client/src/api/http.js`. The same Axios singleton is retained; no
  client call sites, headers, relative URLs, or request/response behavior were
  mechanically rewritten in this phase.

## Compatibility evidence

The existing public-route contract test exercises all six extracted catalog
endpoints, including their methods, response shapes, model queries, and CORS
behavior. The existing authorization tests exercise the extracted middleware's
401, 403, raw/Bearer token, session-store failure, and current-user behavior.
No new broad test suite was added for a code-movement-only change.

## Checks and health results

- `npm run test:backend`: 11 tests passed.
- `npm run verify`: backend tests, frontend route smoke tests, and the
  production client build passed.
- A read-only public HTTPS check returned HTTP 200. No branch code was
  deployed.

## Production impact

No production deployment, service restart, database/Redis/media write, Nginx
change, configuration change, or backup action occurred. This is a source-only
refactor; existing database schemas and API routes remain unchanged.

## Unresolved risks

- This is the first small extraction only. Admin, content/edit, and media
  routes remain in `app.js` for later independently verified steps.
- There is still no isolated staging environment or verified restore test.
- Existing client build warnings remain outside this change.

## Deployment and rollback

No deployment is proposed for this phase. If separately approved, stage this
one commit with the normal public-read, contributor, and administrator smoke
tests. Rollback is code-only: return to the previous commit, rebuild, and
perform an authorized restart. No database or media restoration is required.
