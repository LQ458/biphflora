const assert = require("node:assert/strict");
const { test } = require("node:test");

const { validateSearchEvent } = require("../routes/telemetry");

test("search telemetry rejects raw or unbounded fields", () => {
  assert.equal(
    validateSearchEvent({
      catalogType: "plant",
      languageCategory: "latin_script",
      resultCount: 3,
      selected: true,
    }),
    true,
  );
  assert.equal(
    validateSearchEvent({
      catalogType: "plant",
      languageCategory: "latin_script",
      resultCount: 1,
      selected: false,
      query: "must never be stored",
    }),
    false,
  );
  assert.equal(
    validateSearchEvent({
      catalogType: "plant",
      languageCategory: "latin_script",
      resultCount: 4,
      selected: true,
    }),
    false,
  );
});
