# Dependency security status

This page records the current dependency-audit baseline and the policy used by
the verification workflow. It is a point-in-time package advisory check, not a
claim that the application is free of security defects.

## Baseline

Collected on: 2026-07-23

Registry: `https://registry.npmjs.org`

| Dependency tree            | Scope           | Low | Moderate | High | Critical | Total |
| -------------------------- | --------------- | --: | -------: | ---: | -------: | ----: |
| Root (Express application) | Full tree       |   0 |        0 |    0 |        0 |     0 |
| Root (Express application) | Production only |   0 |        0 |    0 |        0 |     0 |
| Client (React application) | Full tree       |  13 |       11 |   29 |        0 |    53 |
| Client (React application) | Production only |   0 |        0 |    0 |        0 |     0 |

Commands:

```sh
npm audit --json --registry=https://registry.npmjs.org
npm audit --omit=dev --json --registry=https://registry.npmjs.org
npm --prefix client audit --json --registry=https://registry.npmjs.org
npm --prefix client audit --omit=dev --json --registry=https://registry.npmjs.org
```

The root lockfile reported 275 total dependency entries, including 210
production entries. The client lockfile reported 1,587 total entries,
including 109 production entries. These are npm's dependency metadata counts,
not counts of directly declared packages.

## Interpretation

The production-only audit is the enforced security gate for both deployed
dependency trees, and currently reports no known advisories. The 53 remaining
client findings are in development and build tooling inherited through Create
React App 5 and its transitive toolchain. They are not shipped as runtime
dependencies in the production-only audit.

The remaining development findings are still tracked risk. They can affect
developers or CI when processing untrusted inputs, and removing them fully is
expected to require a deliberate frontend build-system migration rather than a
forced lockfile rewrite. No `npm audit fix --force` or other major automatic
upgrade was run.

GitHub Dependabot subsequently identified four direct high-severity runtime
advisories affecting the previous Multer 1.x range. The root dependency is now
pinned to Multer `2.2.0`, the first release covering all four advisory ranges.
The upgrade retains the existing storage, field, count, type, and size limits;
the multipart characterization checks exercise authentication, decoded-image
rejection, path safety, missing-record cleanup, and error responses.

## Policy and follow-up

- CI runs production-only audits against the official npm registry and fails on
  high or critical findings.
- Full-tree audits are reviewed separately so build-tool findings remain
  visible without conflating them with deployed runtime exposure.
- Dependency updates should preserve the existing React and API behavior and
  pass lint, backend tests, frontend tests, and a production build.
- A future Create React App replacement should be handled as a bounded build
  migration with bundle, routing, environment-variable, and browser checks.

## Limitations

`npm audit` reports advisories associated with the resolved package graph. It
does not prove exploitability or non-exploitability in this application, test
application logic, inspect secrets, or replace code review and runtime
monitoring. Results may change when the npm advisory database or lockfiles
change, so this baseline must be re-collected for later releases.
