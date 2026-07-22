import http from "./http";
import { getCatalogNames, invalidateCatalogNames } from "./catalog";

jest.mock("./http", () => ({
  get: jest.fn(),
}));

beforeEach(() => {
  invalidateCatalogNames();
  http.get.mockReset();
});

test("deduplicates concurrent requests and reuses the catalog cache", async () => {
  const names = [{ latinName: "Acer rubrum" }];
  http.get.mockResolvedValue({ data: { names } });

  const [first, second] = await Promise.all([
    getCatalogNames("plant"),
    getCatalogNames("plant"),
  ]);
  const cached = await getCatalogNames("plant");

  expect(first).toBe(names);
  expect(second).toBe(names);
  expect(cached).toBe(names);
  expect(http.get).toHaveBeenCalledTimes(1);
});

test("keeps plant and bird caches separate and supports invalidation", async () => {
  http.get
    .mockResolvedValueOnce({ data: { names: [{ latinName: "Acer rubrum" }] } })
    .mockResolvedValueOnce({ data: { names: [{ latinName: "Corvus corax" }] } })
    .mockResolvedValueOnce({
      data: { names: [{ latinName: "Ginkgo biloba" }] },
    });

  await getCatalogNames("plant");
  await getCatalogNames("bird");
  invalidateCatalogNames("plant");
  await getCatalogNames("plant");

  expect(http.get).toHaveBeenCalledTimes(3);
  await expect(getCatalogNames("fungi")).rejects.toThrow(
    "Catalog type must be plant or bird",
  );
});
