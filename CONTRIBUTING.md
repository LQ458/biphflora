# Contributing

Keep changes incremental and compatible with the current React, Express, MongoDB, Redis, and filesystem media stack. A refactor should preserve existing URLs, request bodies, response shapes, and MongoDB field names unless a separate compatibility plan is documented.

## Local workflow

1. Create a short-lived branch from the current baseline.
2. Install both npm dependency trees with `npm ci` and `npm --prefix client ci`.
3. Use local MongoDB/Redis and an ignored `.env`; never copy production credentials, accounts, logs, or media.
4. Add or update only focused characterization tests for the behavior being changed.
5. Run `npm run verify` before committing.

The root `verify` command runs backend tests, frontend tests, and the production client build. If a check cannot run locally, record the exact reason and do not replace it with an unverified claim.

## Code boundaries

- Put new HTTP composition in the relevant router or service rather than expanding unrelated legacy handlers.
- Use the shared client API and URL helpers; keep media fallback and loading behavior explicit.
- Keep authentication and authorization checks at the route boundary.
- Do not write secrets, raw request data, raw search text, or production identifiers to logs or telemetry.
- Preserve original media and database compatibility. New derived media must use a separate path and be reversible.

## Commits and review

Use ordinary Conventional Commit messages such as `test: add catalog contract coverage` or `refactor: isolate media service`. Branch names and commit metadata must not contain assistant, tool, or generated-by labels. Do not push, open a pull request, deploy, modify Nginx, restart production processes, run migrations, or backfill production media without explicit authorization.

Describe the behavior changed, tests run, production impact, unresolved risks, and rollback steps in the phase report or change description. Keep generated files, build output, dependency caches, dumps, and large media out of Git.
