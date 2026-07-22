# Phase 2 report — authorization boundaries and upload validation

Date: 2026-07-22.

## What changed and why

- Kept optional identity attachment for the existing public personalized
  endpoints, while adding explicit `requireAuth` (401) and `requireAdmin`
  (403) middleware for protected actions.
- `requireAdmin` checks the current User record rather than trusting the
  long-lived `admin` value embedded in a JWT. It now protects management data,
  role changes, approvals, recommendations, and destructive routes.
- A token must also match the active Redis session for its username. A Redis
  lookup/delete failure produces a 503 response for login, logout, and
  protected actions rather than being treated as an invalid token or a
  successful logout.
- Content creation, edit submissions, and media uploads require a valid login.
  Authentication now precedes multipart processing, so anonymous requests do
  not reach Multer's disk-writing middleware.
- Both legacy bare JWTs and standard `Bearer` JWTs are accepted. The client
  adds a Bearer token only to requests sent to its configured API base URL;
  existing explicit raw-token calls remain compatible.
- New registrations no longer write `originalPassword`. Both password fields
  are excluded by default at the schema level, and administrative user lists
  use an explicit public projection plus a DTO that contains only `_id`,
  `username`, and `admin`.
- Added one shared upload policy for JPEG, PNG, and WebP. It writes only
  server-generated filenames to a private temporary directory, verifies image
  content with Sharp, caps each image at 16 MiB, and caps a multipart batch at
  20 files. Failure paths remove temporary/derived files and return generic
  400/413 errors without exposing internals.
- Removed the password column from the administrator UI, since it is no
  longer a supported response field.

## Authorization matrix

| Access | Route groups |
| --- | --- |
| Public or optional identity | Health, login/register/logout/refresh, public catalog/search/detail/count routes, public media/creation reads, and optional user-info/glossary responses. |
| Authenticated contributor | `/edit`, plant/bird/creation submissions, picture/art uploads, and plant/bird edit-request submissions. |
| Current administrator | Admin data/view/role routes; plant, bird, creation, and edit approvals; feature/recommendation management; and user, media, creation, and plant deletion routes. |

The source route handlers are the authoritative mapping. Every protected
operation that writes, approves, changes a role, recommends content, or
removes data now has an explicit guard before its state-changing middleware.

## Upload-limit evidence

Metric: Production image-file distribution used for the server-side per-file
limit.

Exact definition: Aggregate file sizes beneath the live `plantspic` and
`compressed/plantspic` directories; this is not a count of distinct uploaded
images or a measure of upload requests.

Value: 1,229 files; min 32,626 B; median 2,035,805 B; p95 3,130,654 B; max
11,050,829 B; total 2,150,940,650 B. Extension counts: PNG 1,150, JPG 79.
The effective Nginx `client_max_body_size` was 500m.

Time window: Current live filesystem snapshot collected 2026-07-22.

Source: Read-only production filesystem aggregate and effective Nginx
configuration.

Query/calculation: File sizes were sorted numerically; median used the middle
observation and p95 used the ceiling of 95 percent of the ordered file count.
Extension counts used lower-cased filename suffixes only.

Bot/internal-traffic filtering: Not applicable.

Collected on: 2026-07-22.

Confidence: Direct for the enumerated directories at collection time.

Limitations: The directories include derivative files, so this is not a
distinct-image metric. It does not establish historical batch sizes. The 20
file batch cap is an operational guard, not a claim about past user behavior.
The 16 MiB per-file limit exceeds the observed maximum and remains well below
the configured proxy limit; it needs staging upload sampling before deployment.

## Checks and health results

- Backend: 11 tests pass. Seven focused authorization/upload cases cover
  anonymous 401s, non-admin 403, raw and Bearer JWT compatibility, current
  database admin state, session-store failures, secret-field exclusion, and
  invalid multipart cleanup.
- Frontend: 2 existing route smoke tests pass after extending the Axios mock
  for the shared request interceptor.
- Unified local verification: `npm run verify` passed, including the
  production client build.
- Production HTTPS: a read-only request returned HTTP 200. No new code was
  deployed.

## Production impact

No deployment, restart, database write, Redis write, media write, Nginx
change, backup change, or credential/configuration permission change occurred.
The production service remains on its prior commit. The only production reads
in this phase were aggregate media/Nginx evidence and an HTTPS status check.

## Unresolved risks

- Existing database documents may still contain `originalPassword`; this phase
  prevents new writes and responses, but deliberately does not run the
  separately approved cleanup migration.
- Redis session continuity and temporary-upload directory permissions still
  need an isolated staging check before rollout.
- The final upload limits need an isolated staging upload test before any
  production rollout. Historical batch-size telemetry is unavailable.
- A failed upload can leave a gap in a sequential display/code value; it does
  not delete or overwrite existing media, but the sequence is not transactional.
- The code does not yet prevent an administrator from deleting or demoting the
  last administrator; that needs a separately specified policy and test.
- There is no staging environment or verified backup restore. Existing CRA,
  CSS nesting, ESLint, Browserslist, Babel-preset, and Jest open-handle
  warnings remain unchanged.

## Deployment and rollback

No deployment is proposed for this phase.

If separately approved, deploy this one commit only after a verified MongoDB
dump, media manifest, environment/configuration backup, and staging smoke test
using an admin and a standard user. Verify public reads, 401/403 responses,
admin workflows, valid JPEG/PNG/WebP uploads, and invalid/oversized upload
rejection. Do not overwrite `public` or `.env`.

Rollback is code-only: return to the previous commit, rebuild the client, and
perform an authorized service restart. No migration or media change was made,
so no database or file restoration is required for this phase.
