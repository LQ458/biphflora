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

## Initial gate and subsequent deployment

The checks above were the initial access gate and intentionally did not change
the host. After the correct root credential was supplied, the authorized
sequence was completed on 2026-07-22. A protected deployment and its evidence
are recorded in [phase-11-report.md](phase-11-report.md). The deployment used
an isolated release directory and a server-side backup before the cutover; it
did not use `git pull`, reload Nginx, migrate MongoDB, backfill media, or delete
backups.

The deployment gates that remain open even though the release is live are:

1. Independent staging parity and a successful MongoDB/media restore rehearsal.
2. Reliable historical monitoring or a documented server-side aggregation for
   valid sessions, verified visitors, latency, and error-rate metrics.
3. A read-only review of the intermittent SSH banner closures and the server's
   SSH/fail2ban logs.

## Evidence limitation

Traffic values that require server logs—valid visits/sessions, verified unique
visitors, pageviews, route trends, error rates, latency, and historical uptime—
remain `unavailable`. The repository's metric catalog records the exact
definitions and the already verified MongoDB/media/log aggregates without
relabeling request counts as visits.
