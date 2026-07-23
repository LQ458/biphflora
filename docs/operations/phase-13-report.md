# Phase 13 report — frontend API-routing incident and hotfix

Date: 2026-07-23

## Outcome

Production is serving frontend hotfix `4168079`. The homepage, plant catalogue,
plant detail data, bird empty state, and responsive images were exercised in a
real browser after deployment. Both tested pages rendered with zero browser
console errors. No backend restart, database write, media change, Redis change,
or Nginx change was required.

The exact incident duration and affected-user count are unavailable and are not
estimated.

## Incident

The responsive-media frontend build did not contain
`REACT_APP_Source_URL`. The URL helper converted the missing value to an empty
origin, so the browser requested `/getDb2Pic`, `/catalog/...`, and
`/public/variants/...` from the frontend static server instead of the production
`/api` proxy.

The static server returned the SPA HTML fallback with HTTP 200 for the unknown
picture route. Axios therefore treated the response as successful.
`HomeDatabase` stored the missing `response.data.pics` as `undefined` and then
read `pics.length`, which stopped the React render. `BirdHomeDatabase` contained
the same unsafe response assumption. The missing prefix also prevented the
browser from using the responsive image endpoint.

The earlier acceptance checks called backend API and image URLs directly but
did not execute the newly built SPA. They therefore verified the backend
contract without detecting the build-time routing error.

## Immediate recovery

- Atomically restored the saved predeployment frontend build.
- Verified the restored homepage in a browser; it rendered with no console
  errors.
- Preserved the regressed build and the restored build as separate rollback
  evidence.
- Did not restart the frontend or backend process and did not modify Nginx,
  MongoDB, Redis, media, or environment configuration.

## Fix

- Missing, empty, or whitespace-only API configuration now defaults to the
  production `/api` proxy.
- Explicit development or alternate API origins remain supported and trailing
  slashes are normalized.
- Plant and bird homepage picture responses are accepted only when `pics` is an
  array; malformed success bodies fall back to the existing three placeholders.
- Added focused tests for the API-origin default and malformed homepage picture
  response.

Commit: `4168079` — `fix: restore frontend API routing`

## Verification

Local:

- Backend tests: 39 passed.
- Frontend tests: 19 passed across 7 suites.
- Focused routing/homepage tests: 5 passed.
- Production build: succeeded with the previously recorded CRA,
  Browserslist, ESLint, and CSS warnings.
- Compiled bundle contains the `/api` default and responsive-media routes.

Production:

| Gate | Result |
| --- | --- |
| Deployed marker and client build hash | Match `4168079` release |
| Public homepage and readiness | HTTP 200 |
| Plant homepage render | Pass; approved count displayed as 152 |
| Plant homepage responsive images | 3 of 3 loaded with `/api/public/variants` URLs |
| Plant homepage console errors | 0 |
| Bird homepage with zero records | Pass; 3 placeholders displayed |
| Bird homepage console errors | 0 |
| Backend restart | None |
| Database, media, Redis, Nginx changes | None |
| Temporary transfer/build-switch files | 0 after cleanup |

## Production impact

Clients that loaded the regressed frontend could encounter a blank or failed
homepage render. The saved frontend build restored service before the hotfix
was prepared. The final hotfix used an atomic frontend directory swap; backend
and data services remained running.

No reliable client-side telemetry existed for the incident window, so affected
requests, people, duration, and error rate remain unavailable.

## Rollback

The immediately previous working frontend build remains in the timestamped
predeployment backup. Rollback requires only an atomic client build-directory
swap and browser verification; no backend restart or data restore is needed.

## Prevention

- Treat a real browser render and console-error check as a required production
  gate for every frontend build.
- Verify the page's own API and media URLs, not only direct endpoint curls.
- Keep the API proxy default covered by a build-independent unit test.
- Retain the last working frontend build until browser acceptance completes.
