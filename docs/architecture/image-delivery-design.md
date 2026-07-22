# Image delivery and loading design

Date: 2026-07-22.

This design is intentionally incremental. It improves how existing images are
requested before introducing new derivative formats or any production media
backfill.

## Verified current behavior

- MongoDB stores legacy media paths while the server exposes both
  `/public/plantspic` and `/public/compressed/plantspic` trees.
- The upload code currently writes same-name legacy and compressed outputs.
- Several client views instantiate `new Image()` and then render another
  `<img>`. In the bird landing flow the preload targets the original tree while
  the rendered element targets the compressed tree, which creates two distinct
  requests when both files exist.
- Grid images are normally rendered at roughly 15.5–18 viewport-width units;
  zoomed images can reach 70% of the viewport. One source size is therefore not
  appropriate for every context.
- The last verified production aggregate contained 1,229 files across the
  plant-image and compressed-image trees. It did not establish unique-image
  count, dimensions, compression ratio, or the best derivative widths.

## Design decisions

### 1. Fix request behavior before changing storage

- Render the intended final URL directly. Do not preload a different source in
  JavaScript and then insert a second image element.
- Use one bounded `onError` fallback. A missing compressed derivative may fall
  back to the legacy path once; it must not loop between URLs.
- Preserve the original file and every existing database path.

### 2. Loading priority follows viewport role

- Known above-the-fold/LCP candidates remain eagerly loaded. Only a confirmed
  primary image may use `fetchpriority="high"`.
- Below-the-fold gallery, administration, creation, and zoom-preview images use
  native `loading="lazy"` and `decoding="async"`.
- Grid containers reserve space with their existing aspect ratio. Intrinsic
  `width` and `height` are added only when the dimensions are known; fabricated
  dimensions would trade one layout problem for another.

The distinction follows the browser guidance that lazy loading saves work for
off-screen images but delays likely LCP images, and that intrinsic dimensions
or an equivalent aspect ratio prevent layout shifts:

- [web.dev: image performance issues](https://web.dev/learn/images/performance-issues)
- [web.dev: image performance](https://web.dev/learn/performance/image-performance)

### 3. Responsive variants are explicit, never guessed

- A shared client image component accepts an existing fallback URL plus an
  optional, explicit variant descriptor.
- A `<picture>`/`srcset` is emitted only when the API states that each candidate
  exists. Browsers select a supported `<source>`; they do not automatically
  recover from a missing modern-format URL by trying the nested `<img>`.
- Existing documents without variant metadata continue using the current
  compressed/legacy fallback. This makes an additive rollout database-compatible
  and avoids a mandatory backfill.
- Candidate thumbnail/detail widths will be selected after an isolated sample
  records source dimensions, rendered slot sizes, DPR, encoded byte size, and
  visual quality. No fixed width or compression percentage is asserted yet.

Responsive source selection and format fallback follow:

- [MDN: the picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture)
- [MDN: responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)

### 4. New derivatives are additive and deterministic

- New uploads retain the original and current legacy compressed output.
- The derivative pipeline will auto-orient, resize without enlargement, strip
  location/camera metadata by default, and write to a separate versioned
  directory. A failure must remove every derivative from that attempt while
  leaving prior media untouched.
- WebP is the first modern-format candidate. AVIF is deferred until encoding
  time and visual samples justify its additional format and cache variants.
- Sharp processing receives a pixel/input limit and timeout. Output settings
  are validated with representative photographs and artwork rather than one
  universal quality claim.

Relevant implementation behavior is documented by Sharp:

- [Sharp resize API](https://sharp.pixelplumbing.com/api-resize/)
- [Sharp output API](https://sharp.pixelplumbing.com/api-output/)

### 5. Cache only immutable URLs as immutable

- Long-lived `public, max-age, immutable` caching is used only for files whose
  URL changes whenever their bytes change.
- HTML, JSON, and any overwriteable legacy media path keep revalidation-based
  caching. Nginx changes remain a separately approved operational action.
- Format negotiation at one URL is avoided unless the response also uses a
  correct `Vary` strategy. Explicit variant URLs are simpler for the current
  deployment.

See [MDN Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control).

## Measurement gates

For the same route, viewport, cache state, and protocol, record before and
after:

- image request count, failed/fallback request count, and transferred bytes;
- selected source URL/width and rendered CSS width;
- LCP candidate, LCP, and CLS when the browser tooling can measure them;
- derivative input/output bytes, dimensions, format, processing duration, and
  failure result;
- build JavaScript size separately from media transfer size.

Results from local fixtures are labelled as fixture results. Production-sized
claims require an approved staging sample or an aggregate in-place production
calculation. A fresh dimension sample was not collected during this design
pass because the read-only SSH connection did not complete; no dimensions or
compression ratios are inferred from file size alone.

## Rollout and rollback

1. Remove double requests and add bounded fallback for existing media URLs.
2. Add the reusable image component and apply eager/lazy priority by view role.
3. Add and test the derivative service using anonymous local fixtures.
4. Enable optional variant metadata for new uploads only after isolated
   MongoDB/Redis/media validation.
5. Treat any historical backfill and Nginx cache change as separate approved
   operations with a dry-run manifest and media backup.

Rollback first returns clients to existing legacy URLs. New derivative files
are additive and can remain unreferenced; originals are never deleted or
overwritten by this design.
