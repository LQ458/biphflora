# Phase 10 report — client release dependency boundary

Date: 2026-07-22

## Changes

- Classified `react-scripts` and `cssnano` as client `devDependencies`; they
  are required to build/test the static application but are not runtime code
  shipped in `client/build`.
- Added lockfile overrides for compatible patched versions of `@babel/runtime`,
  `nanoid`, `postcss`, and `styled-components`.
- Kept React, React Router, PrimeReact, image compression, and API packages in
  runtime dependencies.

## Verification

- Clean `npm --prefix client ci`: passed.
- Actual installed override versions: `@babel/runtime` 7.26.10, `nanoid`
  3.3.8, `postcss` 8.5.10, and `styled-components` 6.4.4.
- Frontend: 6 suites and 15/15 tests passed.
- Production build completed successfully with the existing CRA/Browserslist
  and ESLint warnings; no new warning category was introduced.
- The generated main bundle remained 129.91 kB gzip, a 49-byte decrease from
  the previous local build in this wave.

## Dependency evidence

```text
Metric: client production dependency advisories
Exact definition: npm audit advisories with devDependencies omitted
Value: 0 total (0 low, 0 moderate, 0 high, 0 critical)
Time window: clean client lockfile installation on 2026-07-22
Source: official npm registry audit endpoint
Query/calculation: npm --prefix client audit --omit=dev --audit-level=high --json
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: high for the lockfile and static production dependency boundary
Limitations: the full development tree still reports CRA-related advisories;
this does not claim CRA migration or eliminate build-tool maintenance risk
```

## Production impact and unresolved risks

No production process, database, media directory, Nginx configuration, or
environment file was changed. No deployment or restart occurred. Runtime
behavior is covered by the existing tests, but the public host still requires
an authenticated SSH connection, backup confirmation, and staging/restore
evidence before rollout. Visits, verified unique visitors, historical uptime,
and production latency remain unavailable.

## Rollback

Revert this commit and reinstall the previous client lockfile. No production
rollback is needed because only local repository files changed.
