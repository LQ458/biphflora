# BiphFlora traffic and product-response report — 2026-07-23

Reporting cutoff: 2026-07-22T17:10:05Z. Raw logs stayed on the production
host. The collector emitted fixed aggregate categories only.

## Strict traffic windows

`Filtered requests` are recognized product-route requests left after bot,
automation, scanner, static/protocol, health, administration, known-internal,
burst, rapid-duplicate, and unknown-route removal. `Document-load candidates`
are 2xx GET/HEAD responses to non-API product routes. Neither metric is a visit,
pageview, or person.

| Window                             | Filtered requests | 2xx document-load candidates | 30-minute session candidates | Approximate signatures |
| ---------------------------------- | ----------------: | ---------------------------: | ---------------------------: | ---------------------: |
| Retained log, 2024-10-31 to cutoff |           182,149 |                       37,409 |                       96,307 |                 35,897 |
| Last 365 days                      |           126,753 |                       23,215 |                       58,067 |                 22,320 |
| Last 90 days                       |            21,989 |                        6,398 |                       15,326 |                  6,720 |
| Last 30 days                       |             5,708 |                        1,802 |                        5,010 |                  2,619 |

The session/signature columns are low confidence: public DNS uses an upstream
proxy, while origin Nginx does not restore a verified client address. The
collector reordered requests within a 24-hour bounded window and observed no
later included entry. These columns must not be relabelled as valid sessions,
visits, unique visitors, or users.

The retained file contained 1,131,690 physical entries when collected;
1,081,407 parsed and 50,283 did not match the combined-log parser. Eighty-three parsed
entries after the fixed cutoff were excluded from window calculations. These
are source-volume facts, not traffic-audience metrics.

## Monthly strict trend

The first and last months are partial retained/cutoff months. These are request
and document-load proxies, not people or visits.

| Month   | Filtered requests | 2xx document-load candidates |
| ------- | ----------------: | ---------------------------: |
| 2024-10 |               355 |                           63 |
| 2024-11 |             4,913 |                        1,654 |
| 2024-12 |             5,009 |                        1,526 |
| 2025-01 |             4,723 |                        1,745 |
| 2025-02 |             7,075 |                        1,586 |
| 2025-03 |             8,630 |                        1,770 |
| 2025-04 |             7,361 |                        1,453 |
| 2025-05 |             7,836 |                        1,678 |
| 2025-06 |             6,145 |                        1,638 |
| 2025-07 |             4,733 |                        1,567 |
| 2025-08 |             4,767 |                        1,622 |
| 2025-09 |             5,135 |                        1,950 |
| 2025-10 |             8,600 |                        1,668 |
| 2025-11 |             6,269 |                        1,283 |
| 2025-12 |            13,117 |                        1,656 |
| 2026-01 |            17,134 |                        1,683 |
| 2026-02 |            21,800 |                        1,926 |
| 2026-03 |            15,869 |                        1,966 |
| 2026-04 |            13,502 |                        3,398 |
| 2026-05 |             8,844 |                        2,249 |
| 2026-06 |             6,031 |                        1,986 |
| 2026-07 |             4,301 |                        1,342 |

## Successful fixed endpoint responses

These are 2xx responses after bot, automation, missing-user-agent, and known
internal-address removal. Query strings and identifiers were discarded.

| Fixed category   | 2xx responses |
| ---------------- | ------------: |
| Plant index API  |         1,547 |
| Plant detail API |         1,538 |
| Media upload     |           372 |
| Creation upload  |            24 |
| Edit submission  |            75 |
| Edit review      |            93 |
| Catalogue review |           295 |
| Creation review  |            28 |
| Catalogue delete |            29 |
| Media delete     |            48 |
| **Total**        |     **4,049** |

The eight write/review/delete categories total 964 responses. A response can be
a repeated test; one upload request can carry multiple files. Index responses
are not searches, and endpoint responses are not people or unique actions.

Their retained monthly distribution is useful as workflow-history evidence,
but still has the same response-count limitations. Months not listed had zero
matching responses.

| Month   | Write/review/delete 2xx responses |
| ------- | --------------------------------: |
| 2024-10 |                                 3 |
| 2024-11 |                                20 |
| 2024-12 |                                36 |
| 2025-01 |                                 6 |
| 2025-02 |                               118 |
| 2025-03 |                               257 |
| 2025-04 |                               115 |
| 2025-06 |                                 4 |
| 2025-08 |                                 1 |
| 2025-10 |                               196 |
| 2025-11 |                               208 |

## Operational distribution

- Highest strict request day: 1,153 on 2026-02-18.
- Highest strict request hour: 392 at 2025-09-02T18:00Z.
- Strict request device categories: 87.10% desktop-or-other, 12.70% mobile,
  0.20% tablet.
- Strict request source categories: 81.67% direct-or-unattributed, 14.67%
  self-referral, 3.17% external referral, 0.45% search, 0.01% social, and 0.04%
  invalid-or-unattributed.
- Strict status classes: 47,326 2xx, 131,061 3xx, 3,720 4xx, and 42 5xx.

All distributions are shares or counts of filtered requests. Historical
uptime, verified visitors, valid visits, geography, new/returning users,
bounce rate, complete SPA pageviews, and pre-telemetry search behavior remain
unavailable.

Reproduce with:

```bash
node scripts/collect-traffic-metrics.js \
  --known-routes-only \
  --as-of 2026-07-22T17:10:05.000Z \
  /path/to/oldest.log /path/to/newest.log
```

The command must run on the log host. Do not copy raw logs into the repository.
