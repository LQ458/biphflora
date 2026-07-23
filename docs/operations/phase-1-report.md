# Phase 1 report — test guardrails and startup boundary

Date: 2026-07-22.

## What changed and why

- Kept app.js as the compatible root entry point while making imports
  side-effect free: importing the Express app no longer starts a listener or
  connects to MongoDB or Redis.
- Added runtime.js to own Redis/MongoDB connection state, readiness, and
  graceful dependency shutdown.
- Added server.js to own HTTP startup, dependency connection, SIGINT/SIGTERM
  handling, and fatal-process shutdown handling.
- Added GET /health/live and GET /health/ready. Live confirms the process can
  answer; ready returns 503 until both MongoDB and Redis are ready. Neither
  endpoint returns configuration values.
- Moved terminal Express error handling to the end of route registration.
- Replaced the failing placeholder tests with backend read-contract tests and
  frontend route smoke tests. Tests use existing Node and CRA tooling only.
- Added root test, build, and verify scripts. Verify runs backend tests,
  frontend tests, and a production build.
- Corrected the login page's invalid nested body element and label attributes,
  which removed React DOM warnings from the route test.

## Checks and health results

- Syntax: app.js, runtime.js, server.js, and both backend test files pass
  Node syntax checks.
- Backend: 4 passing tests cover import isolation, live/ready contracts,
  public plant/bird search-detail-count-refresh contracts, CORS, and graceful
  server shutdown.
- Frontend: 2 passing route smoke tests cover login and unknown-route fallback.
- Unified local verification: npm run verify passed.
- Production build: passed. It required two pre-existing, untracked static
  background assets that were read from production without changing production,
  checksum-verified locally, and kept Git-ignored.
- Production health check: no new code was deployed. Existing production
  services were not restarted during this phase.

## Production impact

No production deployment, service restart, database write, Redis write, media
write, Nginx change, or backup change occurred. The new health endpoints exist
only on the local branch until a separately authorized deployment.

## Unresolved risks

- There is still no staging environment or verified backup restore.
- Existing npm and pnpm locks differ. Local verification deliberately used the
  existing npm lock without changing either lock; lock consolidation remains a
  later, separately verified task.
- The client public asset directory is ignored and not reproducible from Git.
  Two background assets needed for the local build remain untracked. Do not
  treat the local asset copy as a deployment artifact or publish it without an
  approved asset/versioning policy.
- The CRA build passes with pre-existing CSS nesting, ESLint, Browserslist, and
  unmaintained Babel-preset warnings. Jest diagnostics attribute its open
  handle warning to that CRA preset, not application test resources.
- Characterization coverage is deliberately limited to non-destructive public
  read flows. Upload, edit, approval, deletion, and authorization tests remain
  for the security phase so unsafe current behavior is not normalized.
- Readiness is explicit, but existing route handlers still need later
  dependency-failure and authorization hardening.

## Deployment and rollback

No deployment is proposed for this phase.

If deployment is separately approved, build with the same Node/package-manager
decision and verify health endpoints after startup. Deploying must preserve the
production static asset bundle and environment files.

Rollback is code-only: return to the prior commit, rebuild the client with the
verified static bundle, then perform an authorized service restart. No database
migration or media rollback is needed for this phase.
