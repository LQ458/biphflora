# Phase 14 report — button-style regression recovery

Date: 2026-07-23

## Outcome

Production is serving style fix `c5e348e`. Direct navigation to the plant
detail and creation routes now applies the same button styles as the verified
pre-refactor build. Public HTTPS and readiness return 200, the released CSS
hash matches the locally tested build, and the final asset-only cutover did not
change the frontend or backend process IDs.

## Regression and cause

The shared button reset was stored in `home.module.css`. Commit `8b64a7c`
changed `Home` to a lazy-loaded route, so users who opened another route
directly did not load that stylesheet. Those routes consequently displayed
browser-native button backgrounds, borders, cursors, and font sizes. Visiting
Home first could mask the issue, making the result depend on navigation order.

The plant detail `Expand` and gallery-arrow buttons, the creation
`Newest`/`Oldest` controls, the creation page selector, and pagination all
depended on this reset.

## Fix

- Moved the existing global `button` rule to always-loaded `App.css`.
- Removed the duplicate global selector from the lazy Home stylesheet.
- Kept component structure, API contracts, data models, colors, spacing, and
  user interactions unchanged.

Commit: `c5e348e` — `fix: restore global button styles`

## Verification

Local:

- Frontend tests: 19 passed across 7 suites.
- Production build: succeeded.
- Existing CRA, Browserslist, and ESLint warnings remain; no new build failure
  was introduced.
- The locally built creation page matched the retained pre-refactor build for
  the affected computed styles.

Production browser comparison at the same desktop viewport:

| Control | Regressed production | Retained old build and fixed production |
| --- | --- | --- |
| `Expand`, gallery arrows | Native grey background, 2 px outset border, default cursor, 13.33 px font | Transparent background, no border, pointer cursor, 24 px font |
| `Newest`, `Oldest` | Native grey background, 2 px outset border, default cursor, 13.33 px font | Transparent background, no border, pointer cursor, 24 px font |
| Pagination 1–5 | Intended green background plus native 2 px outset border and default cursor | Intended green background, no border, pointer cursor |

The plant detail rendered its information and gallery with the released
stylesheet. The creation page rendered its artwork data and all ten images in
the current viewport loaded successfully.

Additional production gates:

| Gate | Result |
| --- | --- |
| Deployed marker | `c5e348e` |
| Public root and `/api/health/ready` | HTTP 200 |
| Public CSS hash | Exact match with locally tested build |
| Active and isolated-release source CSS | Exact match |
| Final cutover frontend/backend process IDs | Unchanged |
| Database, Redis, media, and Nginx changes | None |
| Active release transfer/next-build files | 0 |

## Deployment event and production impact

Two guarded full-build cutover attempts were rejected and automatically rolled
back when the process/health gates did not remain stable. Moving the complete
build tree interacted with the existing Nodemon-managed production layout; at
least one automatic backend child-process reload was observed. No deliberate
restart was issued. The exact interruption duration and public impact were not
instrumented and are not estimated.

The successful deployment activated only the uniquely hashed CSS file and an
atomic HTML reference update. The corresponding source CSS is present in the
active application and the complete build is retained in the isolated
`c5e348e` release directory. JavaScript, MongoDB, Redis, media, Nginx, and
environment configuration were not changed by the successful cutover.

The active asset manifest still describes the preceding full build because
changing its JSON file would be watched by the current Nodemon arrangement.
The public HTML and exact released CSS hash are the authoritative frontend
asset evidence for this CSS-only hotfix. A later controlled deployment should
ignore `client` build artifacts in the backend watcher before replacing the
complete build.

## Remaining risks

- The backend production launch path still uses Nodemon and is sensitive to
  frontend build-tree changes.
- There is no independent staging environment or completed restore rehearsal.
- Existing CRA/dependency warnings and previously recorded audit findings
  remain outside this focused CSS fix.
- Historical visits, verified unique visitors, uptime, and uninstrumented
  incident duration remain unavailable.

## Rollback

Restore `index.html` and the prior deployed marker from
`/www/backup/biphflora-style-asset-predeploy-20260723T032855Z`, then restore the
two source CSS files from the retained `4168079` release. The new hashed CSS may
remain unused. Recheck the public root, readiness, plant detail, and creation
routes. No process restart, database restore, media restore, or Nginx change is
required for this rollback.

