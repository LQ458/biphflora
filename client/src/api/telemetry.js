import http from "./http";
import urls from "../tools/url";

const telemetryEnabled =
  process.env.REACT_APP_SEARCH_TELEMETRY_ENABLED === "true";

export function classifySearchInput(query) {
  const value = String(query || "").trim();
  if (/^[\p{Script=Han}\s]+$/u.test(value)) {
    return "cjk";
  }
  if (/^[\p{Script=Latin}\s.'-]+$/u.test(value)) {
    return "latin_script";
  }
  return "mixed_or_other";
}

export function createSearchEvent({ query, resultCount, selected, catalogType }) {
  return {
    catalogType: catalogType === "bird" ? "bird" : "plant",
    languageCategory: classifySearchInput(query),
    resultCount: Math.max(
      0,
      Math.min(3, Math.trunc(Number(resultCount) || 0)),
    ),
    selected: Boolean(selected),
  };
}

export function recordSearchAttempt(input) {
  if (!telemetryEnabled) {
    return;
  }

  const event = createSearchEvent(input);
  void http.post(urls.searchTelemetry, event).catch(() => {});
}
