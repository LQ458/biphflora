# Phase 5 report — observability and repository quality

Date: 2026-07-22

## Changes

- Added request IDs and opt-in structured request summaries containing only method, route, status, and duration.
- Added an opt-in audit-event path for successful create, edit, upload, review, delete, role, and feature operations. Actor identity is stored only as a keyed signature; request bodies, tokens, IPs, and usernames are not written.
- Added an opt-in search-event path that records only language category, record type, bounded result count, and selection. Raw search text is never sent or stored.
- Added focused tests for request-context/log redaction, audit allowlisting, telemetry validation, and client-side event aggregation.
- Replaced stale generated README and security templates with current architecture, setup, data-boundary, rollback, and disclosure guidance.
- Added contributor guidance, a Node 20 npm-lockfile CI workflow, and explicit package metadata/Node engine requirements.
- Removed duplicate pnpm lockfiles after npm lockfile verification; npm is the public installation path.

## Defaults and production impact

`REQUEST_LOG_ENABLED`, `AUDIT_EVENTS_ENABLED`, and `SEARCH_TELEMETRY_ENABLED` default to off. Enabling them requires an explicit environment change and a review of retention and access controls. No database schema migration, media rewrite, Nginx change, process restart, or production deployment was performed in this phase. Existing API routes remain compatible; health endpoints and optional telemetry are additive.

## Verification

The phase verification record is maintained with the commit and command output. Required checks are:

- focused backend observability and telemetry tests;
- focused frontend telemetry and URL tests;
- `npm run verify` (backend tests, frontend tests, production build);
- clean `npm ci` installation for both lockfiles;
- dependency and secret scans with exact scope and limitations.

Local result on 2026-07-22: `npm run verify` passed 22 backend tests, 15 frontend tests, and the production build. The build retains existing CRA/Browserslist, CSS-nesting, and ESLint warnings; they are recorded rather than presented as a clean lint result.

The hosted CI run, historical monitor coverage, and staging verification remain external evidence and are not inferred from a local pass.

The official-registry `npm audit --omit=dev --audit-level=high` check found 13 root production-tree advisories (3 moderate, 9 high, 1 critical). The client-tree audit found 65 advisories (13 low, 17 moderate, 32 high, 3 critical), largely through the current CRA toolchain. No automatic or `--force` audit fix was applied: the suggested fixes include breaking upgrades such as Sharp, bcrypt, React Scripts, or major transitive changes and require a separately tested dependency-upgrade phase.

A redacted working-tree scan found no tracked `.env`, key, credential, or certificate files and no credential-shaped connection string. The only matching test file contains synthetic authentication fixtures; values were not copied into the report. This scan does not prove that an untracked server secret or every historical value is safe, so production rotation remains an operations responsibility if a host-side review finds exposure.

## Unresolved risks

- There is no verified staging environment or restore rehearsal for MongoDB, Redis, media, or Nginx configuration.
- Existing production logs do not provide a historical denominator for uptime, latency, unique visitors, or product usage.
- Dependency audit findings remain open; the current scan is evidence of risk, not proof of exploitability in this deployment.
- Audit/search event retention and access controls require an operations decision before enabling them.
- Existing legacy handlers remain in `app.js`; further extraction should continue one boundary at a time.

## Rollback

Disable the optional flags or revert this phase commit. Because the event paths are additive and disabled by default, rollback does not require data restoration. If a flag has been enabled, retain the append-only collections according to the approved retention policy; do not delete them as part of a code rollback.
