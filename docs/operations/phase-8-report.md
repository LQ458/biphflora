# Phase 8 report — cloud access and deployment gate

Date: 2026-07-22

## Read-only checks completed

- The local resolver maps `biphflora.com` to a synthetic/reserved network
  address. An independent DNS-over-HTTPS query returned a separate source
  address; the exact origin address is retained only in private connection
  evidence and is intentionally omitted from this public report.
- TCP port 22 accepted a connection attempt on the DNS-derived origin; the
  other checked common SSH ports (2022, 2200, 2222, 10022) were refused.
- Public HTTPS returned 200 for `/`, `/health/live`, `/health/ready`, and
  `/catalog/names?type=plant`, but each health/catalog response was the 429-byte
  CRA HTML shell rather than JSON. `/api/health/live` returned 404 HTML. The
  current Nginx public routing therefore does not expose the new backend health
  or catalog endpoints.
- The supplied `/Users/LeoQin/Downloads/biphflora connect` file was used only
  as an SSH password source; its contents were not printed or copied. The
  exact path is the only matching `biphflora connect*` file in Downloads; it is
  an ASCII file with 41 bytes, no line terminator, and mode `0644`. Read-only
  authentication attempts for `root` and `ubuntu` on the public hostname did
  not authenticate. The SSH server advertises password authentication; the
  exact file was tested through both `sshpass -f` and OpenSSH askpass, with
  `root` still rejected. No additional usernames or keys were brute-forced.

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
