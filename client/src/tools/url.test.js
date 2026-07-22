import urls, {
  apiOrigin,
  apiUrl,
  mediaUrl,
  mediaVariantUrl,
  responsiveMediaProps,
} from "./url";

test("normalizes API and media paths without changing the configured origin", () => {
  expect(apiUrl("health/live")).toBe(`${apiOrigin}/health/live`);
  expect(mediaUrl("plantspic/example.jpg")).toBe(
    `${apiOrigin}/public/plantspic/example.jpg`,
  );
  expect(mediaUrl("/public/plantspic/example.jpg")).toBe(
    `${apiOrigin}/public/plantspic/example.jpg`,
  );
  expect(
    mediaUrl("/compressed/plantspic/example.jpg", { compressed: true }),
  ).toBe(`${apiOrigin}/public/compressed/plantspic/example.jpg`);
  expect(mediaUrl(undefined)).toBe("");
});

test("the plant count URL matches the existing backend route", () => {
  expect(urls.numOfPlants).toBe(`${apiOrigin}/numOfPlants`);
  expect(urls.uploadPlant).toBe(`${apiOrigin}/uploadPlant`);
});

test("builds versioned responsive media URLs without changing legacy paths", () => {
  expect(mediaVariantUrl("plantspic/example.jpg", { width: 480 })).toBe(
    `${apiOrigin}/public/variants/v1/480/plantspic/example.jpg.webp`,
  );
  expect(mediaVariantUrl("plantspic/example.jpg", { width: 123 })).toBe("");
  expect(mediaVariantUrl("newAboutUs.jpg", { width: 480 })).toBe("");

  const props = responsiveMediaProps("plantspic/example.jpg", {
    sizes: "(max-width: 700px) 50vw, 20vw",
  });
  expect(props.src).toContain(
    "/public/variants/v1/1600/plantspic/example.jpg.webp",
  );
  expect(props.srcSet).toContain(
    "/public/variants/v1/480/plantspic/example.jpg.webp 480w",
  );
  expect(props.sizes).toBe("(max-width: 700px) 50vw, 20vw");
  expect(props.fallbackSrc).toEqual([
    `${apiOrigin}/public/compressed/plantspic/example.jpg`,
    `${apiOrigin}/public/plantspic/example.jpg`,
  ]);
});
