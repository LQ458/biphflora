# Image delivery and loading design

Date: 2026-07-23.

This design is intentionally incremental. It improves how existing images are
requested without changing MongoDB paths or replacing the current media store.

## Verified current behavior

- MongoDB stores legacy media paths while the server exposes both
  `/public/plantspic` and `/public/compressed/plantspic` trees.
- Existing upload contracts still write their legacy outputs. New uploads also
  schedule additive responsive variants after the successful database write;
  variant failure does not change the upload response contract.
- Public catalogue, gallery, detail, home, and creation views use the shared
  image component instead of preloading one URL and rendering another.
- Grid images are normally rendered at roughly 15.5–18 viewport-width units;
  zoomed images can reach 70% of the viewport. One source size is therefore not
  appropriate for every context.
- The verified production population contains 1,033 readable originals with a
  median width of 1600 px and median height of 900 px. The responsive widths are
  480, 960, and 1600 px.

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

### 3. Responsive variants are explicit and versioned

- The shared client helper emits `srcset` and `sizes` for 480, 960, and 1600 px
  versioned URLs. The browser selects one candidate for the rendered slot.
- The backend serves an existing variant with immutable caching. If a requested
  variant is absent, the same URL safely serves the legacy compressed file or
  original with a short cache lifetime. The image component also clears
  `srcset` and walks compressed/original fallbacks after a network error.
- MongoDB continues to store the original legacy path. No variant metadata or
  schema migration is required.

Responsive source selection and format fallback follow:

- [MDN: the picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture)
- [MDN: responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)

### 4. Derivatives are additive and deterministic

- New uploads retain the original and current legacy compressed output.
- The derivative pipeline auto-orients, resizes without enlargement, strips
  location/camera metadata by default, and write to a separate versioned
  directory. A failure must remove every derivative from that attempt while
  leaving prior media untouched.
- WebP quality is 78. AVIF is deferred until encoding
  time and visual samples justify its additional format and cache variants.
- Sharp processing receives a pixel limit and timeout. Files publish through a
  same-directory temporary output and hard link, so an existing destination is
  never overwritten. Rename and deletion workflows also handle compressed and
  versioned derivatives.

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

## Verified production measurements

The 2026-07-23 full-population calculation measured every readable original
and exact-name derivative:

| Width   | Exact pairs | Derivative bytes | Median bytes | Aggregate reduction versus originals |
| ------- | ----------: | ---------------: | -----------: | -----------------------------------: |
| 480 px  |       1,033 |       27,799,366 |       22,712 |                               98.68% |
| 960 px  |       1,033 |       73,519,304 |       54,176 |                               96.52% |
| 1600 px |       1,033 |      135,733,456 |       92,174 |                               93.57% |

All 3,099 planned outputs were created with zero processing failures. Original
bytes remained 2,109,916,481 and total variant storage is 237,052,126 bytes.
These reductions are width-specific; a browser downloads one selected
candidate, and the three percentages must not be added. Human visual review is
not the same as byte measurement.

A file-size-stratified visual check covered five originals at the minimum,
quartile, median, upper-quartile, and maximum positions together with their 480
and 1600 px outputs. The sample included photography and artwork and showed no
obvious decode failure, rotation/crop error, severe blocking, or unusable colour
shift at the rendered inspection sizes. This is a representative smoke check,
not an exhaustive perceptual-quality score.

## Ongoing measurement gates

For the same route, viewport, cache state, and protocol, record before and
after:

- image request count, failed/fallback request count, and transferred bytes;
- selected source URL/width and rendered CSS width;
- LCP candidate, LCP, and CLS when the browser tooling can measure them;
- derivative input/output bytes, dimensions, format, processing duration, and
  failure result;
- build JavaScript size separately from media transfer size.

Results from local fixtures are labelled as fixture results. Production-sized
claims use the aggregate in-place population calculation and never infer image
quality from file size alone.

## Rollout and rollback

1. Double-request removal and bounded legacy fallback are complete.
2. Reusable responsive image selection and viewport-based priority are
   complete for the main public media views.
3. The derivative service passed anonymous local fixture tests.
4. The additive production backfill completed after a 1,033-file dry run and
   capacity check; 3,099 outputs were created without overwriting originals.
5. No Nginx configuration change or MongoDB migration was made.

Rollback first returns clients to existing legacy URLs. New derivative files
are additive and can remain unreferenced; originals are never deleted or
overwritten by this design.
