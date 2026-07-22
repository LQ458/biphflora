# Security policy

BiphFlora is a private, non-commercial project. The repository is not a promise of a supported public service or a guarantee of historical availability. The private-use terms are in [LICENSE](LICENSE).

## Reporting a vulnerability

Do not open a public issue with exploit details, credentials, personal data, raw logs, IP addresses, or production configuration. Send a concise report through the project maintainer's private channel, including:

- the affected commit or deployment version;
- a minimal reproduction that does not use production data;
- impact and any safe mitigation;
- whether the report can be shared with other maintainers.

If no private channel is available, stop at a high-level description in a private repository discussion rather than publishing proof-of-concept material. Response and remediation time are handled case by case; do not assume a service-level target.

## Repository and runtime rules

- Never commit `.env` files, JWT secrets, database URLs with credentials, Redis URLs with credentials, tokens, dumps, raw logs, or production media.
- Keep production credentials in the server's existing secret store or environment configuration. Documentation records only the configuration name and storage location.
- Authentication accepts the legacy bare JWT form and `Bearer` form during migration. Protected routes return `401`; administrator-only routes return `403` to authenticated non-admin users.
- User responses use explicit projections and must not expose password hashes or `originalPassword`.
- Uploads are restricted to JPEG, PNG, and WebP with the limits in `models/uploadPolicy.js`. Validate both metadata and decoded image data.
- Request logging, audit events, and aggregate search telemetry are disabled by default. When enabled, they must not record tokens, passwords, request bodies, IPs, user agents, or raw search text.
- Do not run database migrations, media backfills, destructive cleanup, service restarts, or firewall changes from a normal code review.

## Verification

Run `npm run verify` in a clean local environment before proposing a change. Review the focused authorization, upload, observability, and media tests when touching those boundaries. Report dependency or secret scans as evidence with their exact scope; do not claim that a clean local scan proves the production host is clean.
