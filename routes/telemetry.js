const express = require("express");

const ALLOWED_FIELDS = new Set([
  "catalogType",
  "languageCategory",
  "resultCount",
  "selected",
]);
const CATALOG_TYPES = new Set(["plant", "bird"]);
const LANGUAGE_CATEGORIES = new Set([
  "cjk",
  "latin_script",
  "mixed_or_other",
]);

function validateSearchEvent(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }
  if (Object.keys(body).some((field) => !ALLOWED_FIELDS.has(field))) {
    return false;
  }

  return (
    CATALOG_TYPES.has(body.catalogType) &&
    LANGUAGE_CATEGORIES.has(body.languageCategory) &&
    Number.isInteger(body.resultCount) &&
    body.resultCount >= 0 &&
    body.resultCount <= 3 &&
    typeof body.selected === "boolean"
  );
}

function createTelemetryRouter({ enabled = false, SearchEvent, logger = console }) {
  const router = express.Router();

  router.post("/telemetry/search", async (req, res) => {
    if (!enabled) {
      return res.status(204).end();
    }
    if (!validateSearchEvent(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid search event",
      });
    }

    try {
      await SearchEvent.create({
        ...req.body,
        occurredAt: new Date(),
      });
      return res.status(202).json({ success: true });
    } catch (_) {
      const warn = logger.warn || logger.log;
      warn.call(logger, "Unable to append search event");
      return res.status(503).json({
        success: false,
        message: "Search telemetry unavailable",
      });
    }
  });

  return router;
}

module.exports = { createTelemetryRouter, validateSearchEvent };
