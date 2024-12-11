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
  ],
};

export default function searchPlant(list, pattern) {
  if (!pattern) {
    console.error("Pattern is undefined");
    return [];
  }

  if (!Array.isArray(list)) {
    console.error("List is not an array");
    return [];
  }

  const fuse = new Fuse(list, fuseOptions);
  return fuse.search(pattern);
}
