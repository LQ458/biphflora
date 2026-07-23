# Evidence and metric records

This directory contains public, redacted evidence records for BiphFlora.
It is intentionally limited to aggregate values, reproducible methods, and
explicit limitations. It must never contain credentials, server addresses,
raw access logs, raw user agents, account identifiers, media filenames, or
environment-variable values.

The current baseline is [production-baseline-2026-07-22.md](production-baseline-2026-07-22.md).
The metric register is [metric-catalog.md](metric-catalog.md), the current
redacted traffic report is [traffic-report-2026-07-23.md](traffic-report-2026-07-23.md),
the CV-safe impact record is
[cv-impact-report-2026-07-23.md](cv-impact-report-2026-07-23.md), the current
lab and local performance record is
[performance-baseline-2026-07-23.md](performance-baseline-2026-07-23.md), and
collection rules are in [collection-method.md](collection-method.md).
Future daily aggregate retention is described in
[traffic-metric-retention.md](../operations/traffic-metric-retention.md).

## Status vocabulary

- Direct: measured from the authoritative source at the stated collection time.
- Proxy: useful but not equivalent to the requested business metric.
- Unavailable: no trustworthy source or calculation currently exists.
- Candidate: evidence of an event that still cannot prove the event by itself.

No metric may be promoted from proxy or unavailable to direct without adding
the source, calculation, filtering rules, collection date, and limitations.

## Public and private boundary

The corresponding private evidence register keeps operational source locations,
command/query text, and backup-review notes. It still excludes secret values,
raw logs, personal data, IP addresses, and unredacted user feedback. Git keeps
only this redacted version so the public repository remains safe to share.
