# Changelog

This changelog starts from the repository's current `3.0.0` line. The root
package has identified itself as `3.0.0` since the version update on
2024-11-25. The dated entry below summarizes the verified repository baseline
recorded on 2026-07-23; it does not infer a release event. The git history
contains no release tags from which to reconstruct earlier version sections.

## [Unreleased]

### Added

- A loopback-only MongoDB and Redis development environment with deterministic,
  anonymous seed data.
- A bounded reset command for removing the anonymous fixtures, generated demo
  media, and repository-managed local service volumes.
- Reproducible dependency, search-performance, architecture, and operational
  evidence documentation.

### Changed

- Strengthened CI with frontend linting, production dependency audits, and a
  pinned secret-scanning action.
- Reduced static background and favicon transfer size while retaining existing
  visual and URL behavior.
- Updated project setup, architecture, dependency, and review guidance to match
  the implemented system.
- Aligned root and client package metadata with the documented 3.0.0 project
  state and explicit server entry point.

### Fixed

- Removed the existing frontend lint and Browserslist warning backlog and
  restored strict warnings-as-errors verification.
- Improved client landmarks, accessible names, and text contrast identified by
  the documented Lighthouse baseline.
- Percent-encoded legacy media path segments so filenames containing whitespace
  remain valid `srcset` candidates instead of falling back to the largest
  image.
- Removed an unreferenced duplicate video-modal component.
- Upgraded Multer from the deprecated 1.x line to 2.2.0 after four direct
  high-severity runtime advisories were identified, retaining the existing
  upload validation and cleanup contracts.

## [3.0.0] - 2026-07-23

### Added

- Characterization and contract coverage for application composition,
  authorization, lifecycle, media, catalogue, telemetry, and client behavior.
- Liveness/readiness reporting, graceful dependency shutdown, optional
  privacy-conscious request/audit/search telemetry, and redacted evidence
  collection commands.
- A lightweight catalogue-name endpoint with client-side caching and in-flight
  request coalescing.
- Versioned 480, 960, and 1600 pixel WebP media variants, responsive client
  selection, legacy fallback, lifecycle cleanup, and an explicit backfill tool.

### Changed

- Enforced authenticated and administrator route boundaries through signed
  JWTs, Redis active-session matching, and current-user checks in MongoDB.
- Restricted image uploads by type and size, validated decoded metadata, and
  added bounded processing plus failure cleanup.
- Separated authentication, content, catalogue, runtime, and filesystem media
  responsibilities from the central Express composition.
- Centralized React API/URL access, lazy-loaded route bundles, and shared image
  loading behavior while preserving existing route and MongoDB path contracts.
- Hardened production dependency selection, split frontend build dependencies,
  and added a combined backend, frontend, and production-build verification
  workflow.

### Fixed

- Restored frontend API routing after the compatibility refactor.
- Restored global button styles and packaged optimized background assets used
  by the production client build.
- Kept frontend warnings visible during the initial compatibility work pending
  the follow-up cleanup recorded under Unreleased.
