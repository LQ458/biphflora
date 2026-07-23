import searchPlant from "./SearchPlant";

const catalog = [
  {
    latinName: "Acer rubrum",
    chineseName: "红花槭",
    commonName: "red maple",
    otherNames: ["swamp maple"],
  },
  {
    latinName: "Ginkgo biloba",
    chineseName: "银杏",
    commonName: "maidenhair tree",
  },
  {
    latinName: "Camellia japonica",
    chineseName: "山茶",
    commonName: "Japanese camellia",
  },
];

test.each([
  ["红花槭", "Acer rubrum"],
  ["red maple", "Acer rubrum"],
  ["Ginkgo biloba", "Ginkgo biloba"],
  ["Ginko", "Ginkgo biloba"],
  ["swamp maple", "Acer rubrum"],
])("finds multilingual and fuzzy query %s", (query, expectedLatinName) => {
  expect(searchPlant(catalog, query)[0].item.latinName).toBe(expectedLatinName);
});

test("returns no result for an unrelated query and invalid input", () => {
  expect(searchPlant(catalog, "zzzzzzzzzzzz")).toEqual([]);
  expect(searchPlant(null, "maple")).toEqual([]);
  expect(searchPlant(catalog, "")).toEqual([]);
});
