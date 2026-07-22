# Phase 8 report — cloud access and deployment gate

Date: 2026-07-22

## Read-only checks completed

- `biphflora.com` resolves through the current network path to `198.18.0.85`;
  this is a documentation-only observation because the address is in a
  synthetic/reserved range and is not treated as the origin identity.
- TCP port 22 accepted a connection attempt.
- Public HTTPS returned 200 for `/`, `/health/live`, `/health/ready`, and
  `/catalog/names?type=plant`, but each health/catalog response was the 429-byte
  CRA HTML shell rather than JSON. `/api/health/live` returned 404 HTML. The
  current Nginx public routing therefore does not expose the new backend health
  or catalog endpoints.
- The supplied `/Users/LeoQin/Downloads/biphflora connect` file was used only
  as an SSH password source; its contents were not printed or copied. Read-only
  authentication attempts for the documented candidates `root` and `ubuntu`
  returned permission denied. No additional usernames or keys were brute-forced.

## Deployment status

No server write, process restart, Nginx reload, database write, media write, or
backup deletion occurred. The release remains local and is not production
approved. A successful SSH identity (host, username, and accepted key/password
format) is required before the following authorized sequence can begin:

1. Read-only process/container, deployment commit, disk, MongoDB, Redis, media,
   backup, TLS, and log checks.
2. Separate backups and manifests for MongoDB, media, environment/configuration,
   Redis decision, and log metric cutoff.
3. Isolated smoke/restore check or an explicit staging exception.
4. One-commit deployment, health verification, traffic/error observation, and
   recorded rollback point.

## Evidence limitation

Traffic values that require server logs—valid visits/sessions, verified unique
visitors, pageviews, route trends, error rates, latency, and historical uptime—
remain `unavailable`. The repository's metric catalog records the exact
definitions and the already verified MongoDB/media/log aggregates without
relabeling request counts as visits.
