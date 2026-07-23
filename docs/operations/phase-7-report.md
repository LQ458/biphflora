# Phase 7 report — low-risk dependency and build hygiene wave

Date: 2026-07-22

## Changes

- Updated the compatible server dependency ranges for `body-parser`, `express`,
  `jsonwebtoken`, and `mongoose`; the lockfile records the exact resolved
  versions. The unused `fs` package entry was removed; application imports use
  Node's built-in module.
- Updated the compatible client dependency ranges for `axios`, `immutable`,
  and `react-router-dom`, with a fresh client lockfile.
- Flattened the one nested CSS selector in `uploadHome.css`, removing the
  corresponding CSS-nesting build warning without changing the selector's
  behavior.
- Moved the repository verification workflow from Node 20 to Node 22. The
  package engine remains unchanged until the production Node version is
  verified.

## Verification

- Clean local `npm ci` with install scripts: passed.
- Clean local `npm --prefix client ci`: passed.
- Backend: 22/22 tests passed.
- Frontend: 6 suites and 15/15 tests passed.
- Production build completed successfully. The CSS-nesting warning is gone.
- Remaining build warnings are the existing CRA/Babel, Browserslist, ESLint,
  and Jest open-handle warnings; this wave does not suppress them.

## Dependency evidence

The official-registry `npm audit --omit=dev --audit-level=high` result for the
root production tree is:

```text
Metric: root production dependency advisories
Exact definition: npm audit advisories with dev dependencies omitted
Value: 8 total (1 moderate, 6 high, 1 critical)
Time window: dependency tree resolved on 2026-07-22
Source: npm registry audit endpoint
Query/calculation: npm audit --omit=dev --audit-level=high --json
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: high for this lockfile and registry snapshot
Limitations: bcrypt 5, sharp 0.33, and CRA transitive/native risks remain;
major upgrades were intentionally deferred for staging compatibility testing
```

The client-tree result is:

```text
Metric: client dependency advisories
Exact definition: npm audit advisories for client/package-lock.json
Value: 59 total (13 low, 16 moderate, 27 high, 3 critical)
Time window: dependency tree resolved on 2026-07-22
Source: npm registry audit endpoint
Query/calculation: npm --prefix client audit --audit-level=high --json
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: high for this lockfile and registry snapshot
Limitations: most remaining high/critical findings are CRA 5 transitive or
development-tool findings; the CRA-to-Vite migration is a separate tested wave
```

## Production impact and unresolved risks

No production process, database, media directory, Nginx configuration, or
environment file was changed. No deployment, restart, migration, media
backfill, or backup deletion occurred. The dependency changes are not
production-approved until the host Node version, staging smoke test, backup
coverage, and rollback path are verified.

There is still no independent staging or restore rehearsal. Native dependency
upgrades (`bcrypt` 6, `sharp` 0.35, and `multer` 2), the CRA migration, and
remaining lint/build warnings require separate compatibility work. Visits,
verified unique visitors, historical uptime, and production latency remain
unavailable without server-side evidence.

## Rollback

Revert this phase commit and reinstall the prior lockfiles. The CSS change is
source-only. No database or media rollback is needed because production was not
modified. Before any production deployment, capture separate MongoDB, media,
environment, Nginx/宝塔, Redis, and log-cutoff backups as described in
`deployment-readiness.md`.
