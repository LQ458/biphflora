# Performance baseline — 2026-07-23

This report separates a one-run public-site lab observation, local deterministic
search timing, and source-tree asset measurements. It is not real-user
monitoring, an uptime statement, or proof that an undeployed source change has
improved the public site.

## Public home-page lab observation

The public URL was measured once per Lighthouse form factor with Lighthouse
13.4.1 and headless Chrome 150 on macOS arm64. Lighthouse used its simulated
throttling profiles and a cold run. Scores and timings can vary between runs,
machines, networks, browser versions, and server states.

| Form factor | Performance | Accessibility | Best practices | SEO |   FCP |    LCP |   TBT | CLS | Requests | Transfer bytes |
| ----------- | ----------: | ------------: | -------------: | --: | ----: | -----: | ----: | --: | -------: | -------------: |
| Mobile      |          58 |            80 |            100 |  92 | 6.1 s | 12.9 s | 70 ms |   0 |       12 |     14,734,259 |
| Desktop     |          85 |            80 |            100 |  92 | 0.7 s |  1.9 s |  0 ms |   0 |       12 |     14,250,731 |

```text
Metric: public home-page mobile Lighthouse observation
Exact definition: one Lighthouse 13.4.1 navigation of https://www.biphflora.com/ using the default mobile form factor and simulated throttling
Value: performance 58; accessibility 80; best practices 100; SEO 92; FCP 6.1 s; LCP 12.9 s; TBT 70 ms; CLS 0; 12 requests; 14,734,259 transfer bytes
Time window: fetch started 2026-07-23T04:46:25.397Z
Source: public HTTPS responses and Lighthouse JSON output
Query/calculation: command below; values read from Lighthouse category and audit fields
Bot/internal-traffic filtering: not applicable; this is a synthetic navigation
Collected on: 2026-07-23
Confidence: direct for this single run
Limitations: not field data, not a percentile, not a before/after experiment, and not representative of all routes or users
```

```text
Metric: public home-page desktop Lighthouse observation
Exact definition: one Lighthouse 13.4.1 navigation of https://www.biphflora.com/ using the desktop preset
Value: performance 85; accessibility 80; best practices 100; SEO 92; FCP 0.7 s; LCP 1.9 s; TBT 0 ms; CLS 0; 12 requests; 14,250,731 transfer bytes
Time window: fetch started 2026-07-23T04:46:49.033Z
Source: public HTTPS responses and Lighthouse JSON output
Query/calculation: command below; values read from Lighthouse category and audit fields
Bot/internal-traffic filtering: not applicable; this is a synthetic navigation
Collected on: 2026-07-23
Confidence: direct for this single run
Limitations: not field data, not a percentile, not a before/after experiment, and not representative of all routes or users
```

The mobile run transferred a 12,727,636-byte JPEG background. The current
source tree references a 764,400-byte WebP replacement for that role, but that
does not establish a public-site improvement until the corresponding build is
deployed and remeasured under the same protocol and conditions.

The same run also identified missing accessible button text, insufficient
contrast, a missing main landmark, and a missing meta description. The source
changes address those concrete markup/style findings; their score effect is not
claimed before a comparable post-deployment run.

### Reproduction

```sh
npx --yes lighthouse@13.4.1 https://www.biphflora.com/ \
  --output=json \
  --output-path=/tmp/biphflora-lighthouse-mobile.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --quiet

npx --yes lighthouse@13.4.1 https://www.biphflora.com/ \
  --preset=desktop \
  --output=json \
  --output-path=/tmp/biphflora-lighthouse-desktop.json \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --quiet
```

The JSON files are measurement artifacts, not repository inputs, and are not
committed.

## Source-tree static assets

These are exact file-size comparisons, not route transfer or visual-quality
scores.

| Asset role               | Earlier bytes | Current bytes | Size reduction | Dimension change                                |
| ------------------------ | ------------: | ------------: | -------------: | ----------------------------------------------- |
| Database background      |    12,727,636 |       764,400 |         93.99% | existing optimized source asset, 2560×1440      |
| Home database background |       767,422 |        88,274 |         88.50% | 8192×4608 JPEG → 2560×1440 WebP                 |
| Favicon                  |       206,283 |         3,372 |         98.37% | 500×500 PNG payload → 64×64 indexed PNG payload |

The home database source and its WebP output were visually inspected at the
intended background framing. This was a smoke check for obvious crop, rotation,
colour, or decode defects, not a perceptual-quality study. The original tracked
home background remains in the repository for compatibility but is no longer
referenced by the client CSS.

## Local search timing

The search benchmark uses the same Fuse.js options as the plant search helper,
153 deterministic synthetic name records, six Chinese/English/Latin/alias/typo/
missing query cases, 100 index builds, and 6,000 measured queries. It excludes
HTTP, MongoDB, React rendering, production contention, and real query
distribution.

```text
Metric: local synthetic Fuse.js index-build timing
Exact definition: construction time for a Fuse.js 7.1.0 index over 153 deterministic synthetic name records
Value: mean 0.1071 ms; p50 0.0739 ms; p95 0.2019 ms; p99 0.4571 ms across 100 builds
Time window: one local command completed on 2026-07-23
Source: scripts/benchmark-search.js on Node v23.9.0, macOS arm64
Query/calculation: performance.now duration for each independent index construction, followed by nearest-rank percentiles
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct for this local fixture run
Limitations: synthetic data and one machine; excludes fetch, database, UI, and production load
```

```text
Metric: local synthetic Fuse.js query timing
Exact definition: Fuse.js search duration over the same 153-record index for six fixed multilingual/fuzzy cases repeated 1,000 times
Value: mean 0.7574 ms; p50 0.6975 ms; p95 1.1292 ms; p99 1.1938 ms across 6,000 queries
Time window: same local command on 2026-07-23
Source: scripts/benchmark-search.js on Node v23.9.0, macOS arm64
Query/calculation: performance.now duration around each search, followed by nearest-rank percentiles
Bot/internal-traffic filtering: not applicable
Collected on: 2026-07-23
Confidence: direct for this local fixture run
Limitations: not API latency or field search latency; synthetic data does not establish search quality for production names
```

Reproduce with:

```sh
npm run evidence:search-performance
```

Do not combine the image byte reductions, Lighthouse scores, or search timings
into one performance percentage. Each measurement has a different definition
and boundary.
