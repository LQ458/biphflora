import { classifySearchInput, createSearchEvent } from "./telemetry";

jest.mock("./http", () => ({
  post: jest.fn(),
}));

test("search telemetry keeps only bounded aggregate categories", () => {
  expect(classifySearchInput("红花槭")).toBe("cjk");
  expect(classifySearchInput("Acer rubrum")).toBe("latin_script");
  expect(classifySearchInput("红花槭 Acer")).toBe("mixed_or_other");

  const event = createSearchEvent({
    query: "Acer rubrum",
    resultCount: 12,
    selected: true,
    catalogType: "plant",
  });
  expect(event).toEqual({
    catalogType: "plant",
    languageCategory: "latin_script",
    resultCount: 3,
    selected: true,
  });
  expect(JSON.stringify(event)).not.toContain("Acer rubrum");
});
