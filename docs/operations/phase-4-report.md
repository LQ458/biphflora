# Phase 4 report — search and image delivery optimization

Date: 2026-07-22.

## What changed and why

- Added a small `GET /catalog/names?type=plant|bird` directory endpoint with
  an explicit name-only projection. Legacy search endpoints remain available
  for compatibility.
- Reused the client Fuse.js catalog snapshot instead of rebuilding the same
  search index for every component/request. The cache keeps plant and bird
  directories separate and supports invalidation after a write.
- Added the shared `MediaImage` component with direct compressed URLs, one
  bounded legacy fallback, native lazy loading, asynchronous decoding, and
  explicit eager loading for known above-the-fold images.
- Added route-level React lazy loading and removed the bird landing flow's
  preload of an original image before rendering its compressed counterpart.
- Kept MongoDB media paths, existing originals, legacy derivatives, and API
  response contracts unchanged. No historical media backfill or new format
  migration was attempted.

## Checks and evidence

- Backend contract and characterization tests cover the catalog directory,
  legacy search/read routes, media path helpers, and fallback behavior.
- Frontend tests cover catalog cache reuse, search URL behavior, image URL
  fallback, lazy/eager loading, and asynchronous decoding. The current
  cumulative verification is 24 backend tests and 15 frontend tests passing.
- The production build completed. The current main JavaScript bundle is
  129.91 kB gzip and the main CSS bundle is 60.3 kB gzip. These are build
  artifacts, not claims about page-load latency.
- Public image delivery was later verified with a read-only sample returned by
  `/api/getDb2Pic`; one compressed media request returned HTTP 200. The full
  deployment evidence is in [phase-11-report.md](phase-11-report.md).

## Production impact

The optimization was developed and verified locally before the protected
cutover. It preserves old URLs and database references. The subsequent
production deployment used a backup, an isolated release smoke check, and a
rollback directory; it did not rewrite the media tree or run a backfill.

## Unresolved risks

- No approved dimensions/quality sample or full matched original/derivative
  analysis is available. Average size, compression ratio, and storage saved
  remain `unavailable`.
- No browser performance trace, LCP/CLS series, image-failure rate, or
  search-latency history is available. The bundle size is not a substitute for
  those metrics.
- Responsive `srcset`/WebP/AVIF variants and immutable cache headers remain
  additive follow-up work requiring staging samples and separate Nginx
  approval. Existing media files are never overwritten by this phase.

## Rollback

Restore the previous client build and code commit from the protected backup,
then perform the authorized backend restart and public health/search checks.
Because no database path or media file was migrated, no MongoDB or media
restore is required for a code-only rollback.
