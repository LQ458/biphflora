# Traffic metric retention

The existing traffic collector can be run once for historical analysis. The
snapshot wrapper makes that evidence durable when Nginx later rotates or
deletes raw logs. It writes one private, append-only aggregate JSON file per UTC
day and never writes raw IP addresses, user agents, URLs, credentials, or log
lines.

This is server-side operational evidence, not a third-party user tracker.
Requests, document-load candidates, session candidates, and estimated
signatures remain separate measures. None may be described as verified people,
valid visits, pageviews, or uptime.

## Private server setup

Keep the output, stable HMAC secret, and internal/test address exclusions
outside the Git repository. Example placeholders:

```bash
install -d -m 700 /private/metrics/traffic
install -d -m 700 /private/biphflora-metrics
openssl rand -hex 32 > /private/biphflora-metrics/traffic-hmac
chmod 600 /private/biphflora-metrics/traffic-hmac
```

Create an optional root-readable file containing one known developer,
administrator, or synthetic-check address per line. Do not commit that file.
The HMAC secret is read only in memory and is never included in output.

Run a snapshot after the UTC day has closed, including the active access log
and all retained rotated access logs. By default the wrapper names and cuts off
the previous complete UTC day:

```bash
node scripts/snapshot-traffic-metrics.js \
  --output-dir /private/metrics/traffic \
  --secret-file /private/biphflora-metrics/traffic-hmac \
  --exclude-ip-file /private/biphflora-metrics/internal-addresses \
  --site-host biphflora.com \
  /path/to/nginx/access.log.*.gz \
  /path/to/nginx/access.log
```

The wrapper always enables the collector's strict known-product-route mode,
sets directory/file modes to `0700`/`0600`, validates the secret file mode,
resolves the real output path before refusing repository output, writes
atomically, and will not replace an existing day's snapshot.

## Scheduling and retention

Use the existing 宝塔 scheduled-task facility or cron to run the command daily
under a single-instance lock and alert on a non-zero exit. Keep the schedule,
real paths, and secret-store location in the private operations record, not in
the public repository. A representative cron shape is:

```text
25 00 * * * cd /path/to/biphflora && flock -n /run/lock/biphflora-traffic.lock node scripts/snapshot-traffic-metrics.js [private options and retained access logs]
```

Retain the small aggregate snapshots for the service lifetime unless a shorter
approved policy applies. Raw Nginx logs keep their independent rotation policy.
Do not delete a raw log until at least one successful snapshot covers its time
range. Review snapshot creation monthly and record any collection gaps.

Each daily file contains the exact definition, source range, collection time,
30/90/365-day windows, monthly trend, peak request periods, filters,
successful fixed endpoint-response categories, confidence limitations, and
unavailable metrics. This preserves reproducible project evidence without
moving raw identifiers off the server.

## Optional product-use evidence

`AUDIT_EVENTS_ENABLED` and `SEARCH_TELEMETRY_ENABLED` remain off by default.
Enabling them changes production data collection and therefore requires a
separate retention/privacy review and deployment approval. When enabled, run
`npm run evidence:product` monthly and record the coverage start; earlier
searches or operations cannot be backfilled.

## Disable and recover

Disable only the scheduled task; no Nginx reload, application restart,
database migration, or media change is required. Existing aggregate snapshots
remain readable JSON. A failed or missing day is recorded as a collection gap
rather than reconstructed from assumptions.
