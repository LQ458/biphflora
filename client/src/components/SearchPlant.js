import Fuse from "fuse.js";

const fuseOptions = {
  isCaseSensitive: false,
  includeScore: false,
  shouldSort: true,
  includeMatches: false,
  findAllMatches: true,
  minMatchCharLength: 1,
  location: 0,
  threshold: 0.5,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
  fieldNormWeight: 1,
  keys: [
    { name: "latinName", weight: 0.3 },
    { name: "chineseName", weight: 0.3 },
    { name: "commonName", weight: 0.4 },
    { name: "otherNames", weight: 0.1 },
  ],
};

const searchIndexes = new WeakMap();

export function createPlantSearchIndex(list) {
  if (!Array.isArray(list)) {
    return null;
  }

  return new Fuse(list, fuseOptions);
}

export default function searchPlant(list, pattern) {
  if (!pattern || !Array.isArray(list)) {
    return [];
  }

  let fuse = searchIndexes.get(list);
  if (!fuse) {
    fuse = createPlantSearchIndex(list);
    searchIndexes.set(list, fuse);
  }

  return fuse.search(pattern);
}
