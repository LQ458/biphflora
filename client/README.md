# BiphFlora client

This directory contains the React single-page application. It talks to the Express API through the shared helpers in `src/api/` and `src/tools/`; pages should not construct ad-hoc media URLs or duplicate request error handling.

## Local development

From the repository root:

```sh
npm ci
npm --prefix client ci
npm --prefix client start
```

The API base URL is read from the existing CRA variable
`REACT_APP_Source_URL`; without it, the client uses the
production-compatible `/api` prefix. Keep local values in an ignored
`.env.local` file. Search telemetry is opt-in with
`REACT_APP_SEARCH_TELEMETRY_ENABLED=true`; its payload contains only a language
category, result count, selection flag, and record type.

## Checks

```sh
npm --prefix client run lint
npm --prefix client test -- --watchAll=false --runInBand
npm --prefix client run build
```

`npm run verify` at the repository root runs the backend tests, strict frontend
lint, these frontend tests, and a production build together.

## Delivery behavior

The client uses route-level loading for larger pages, cached catalog data for Fuse search, and lazy derived media with a bounded original-image fallback. Do not remove the fallback or change media path conventions without checking the compatibility tests and [the image delivery design](../docs/architecture/image-delivery-design.md).
