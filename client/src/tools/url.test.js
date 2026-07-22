import urls, { apiOrigin, apiUrl, mediaUrl } from "./url";

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
});
