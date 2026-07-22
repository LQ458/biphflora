import http from "./http";
import urls from "../tools/url";

const VALID_CATALOG_TYPES = new Set(["plant", "bird"]);
const CACHE_TTL_MS = 5 * 60 * 1000;
const catalogCache = new Map();
const pendingRequests = new Map();
const cacheVersions = new Map();

const assertCatalogType = (type) => {
  if (!VALID_CATALOG_TYPES.has(type)) {
    throw new TypeError("Catalog type must be plant or bird");
  }
};

export async function getCatalogNames(type) {
  assertCatalogType(type);

  const now = Date.now();
  const cached = catalogCache.get(type);
  if (cached && cached.expiresAt > now) {
    return cached.names;
  }

  const version = cacheVersions.get(type) || 0;
  const pending = pendingRequests.get(type);
  if (pending?.version === version) {
    return pending.promise;
  }

  const request = http
    .get(urls.catalogNames(type))
    .then((response) => {
      const names = Array.isArray(response.data?.names)
        ? response.data.names
        : [];
      if ((cacheVersions.get(type) || 0) === version) {
        catalogCache.set(type, {
          names,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
      }
      return names;
    })
    .finally(() => {
      if (pendingRequests.get(type)?.promise === request) {
        pendingRequests.delete(type);
      }
    });

  pendingRequests.set(type, { promise: request, version });
  return request;
}

export function invalidateCatalogNames(type) {
  if (type === undefined) {
    catalogCache.clear();
    for (const catalogType of VALID_CATALOG_TYPES) {
      cacheVersions.set(catalogType, (cacheVersions.get(catalogType) || 0) + 1);
    }
    return;
  }

  assertCatalogType(type);
  catalogCache.delete(type);
  cacheVersions.set(type, (cacheVersions.get(type) || 0) + 1);
}
