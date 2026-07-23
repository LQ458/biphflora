# Phase 9 report — native dependency hardening

Date: 2026-07-22

## Changes

- Upgraded `bcrypt` from 5.x to 6.0.0 and `sharp` from 0.33.x to 0.35.3.
- Added two focused characterization checks: a pre-existing bcrypt hash still
  verifies, and the Sharp metadata API used by the compressor remains stable.
- Added lockfile overrides for `bn.js` 4.12.3 and `path-to-regexp` 0.1.13.
  These are transitive patch-level security fixes; Express remains on the 4.x
  API and `connect-mongo` remains unchanged.
- Deferred `multer` 2.x until an isolated upload compatibility run is
  available; Multer 1.x remains a known warning in the install output.

## Verification

- Clean root `npm ci` with native install scripts: passed.
- Backend: 24/24 tests passed, including authorization, upload cleanup, image
  processing, legacy bcrypt verification, Sharp metadata, and graceful
  shutdown.
- Frontend: 6 suites and 15/15 tests passed.
- Production build completed successfully; existing CRA/Browserslist/ESLint
  warnings remain and are not suppressed.
- Actual installed versions after clean install: bcrypt 6.0.0, sharp 0.35.3,
  express 4.22.2, path-to-regexp 0.1.13, and bn.js 4.12.3.

## Dependency evidence

```text
Metric: root production dependency advisories
Exact definition: npm audit advisories with dev dependencies omitted
Value: 0 total (0 low, 0 moderate, 0 high, 0 critical)
Time window: clean lockfile installation on 2026-07-22
Source: official npm registry audit endpoint
Query/calculation: npm audit --omit=dev --audit-level=high --json
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-22
Confidence: high for this lockfile and registry snapshot
Limitations: does not prove exploitability or remove client CRA findings;
multer 1.x and the CRA toolchain still need separate compatibility work
```

## Production impact and unresolved risks

No production process, database, media directory, Nginx configuration, or
environment file was changed. No deployment or restart occurred. The native
upgrades are locally compatible but still require the approved staging/backup
gate before production rollout. The client audit remains 59 advisories,
primarily through CRA 5 transitive tooling; visits, verified unique visitors,
historical uptime, and production latency remain unavailable.

## Rollback

Revert this commit and reinstall the prior root lockfile. No data or media
rollback is needed because production was not modified. If a future production
rollout fails, restore the previously recorded application commit and use the
separately verified environment/media/database backups.
