export const normalizeApiOrigin = (value) => {
  const configuredOrigin = String(value || "")
    .trim()
    .replace(/\/+$/, "");
  return configuredOrigin || "/api";
};

export const apiOrigin = normalizeApiOrigin(process.env.REACT_APP_Source_URL);

const withLeadingSlash = (path) => {
  const value = String(path ?? "");
  return value.startsWith("/") ? value : `/${value}`;
};

export const apiUrl = (path = "") => `${apiOrigin}${withLeadingSlash(path)}`;

const encodeMediaPath = (path) =>
  withLeadingSlash(path)
    .split("/")
    .map((segment) => {
      if (!segment) {
        return segment;
      }

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (_) {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

export const mediaUrl = (path, { compressed = false } = {}) => {
  if (!path) {
    return "";
  }

  const mediaPath = withLeadingSlash(path).replace(/^\/public(?=\/)/, "");
  const normalizedPath = compressed
    ? mediaPath.replace(/^\/compressed(?=\/)/, "")
    : mediaPath;

  return `${apiOrigin}${encodeMediaPath(
    `/public${compressed ? "/compressed" : ""}${normalizedPath}`,
  )}`;
};

export const MEDIA_VARIANT_VERSION = "v1";
export const MEDIA_VARIANT_WIDTHS = [480, 960, 1600];

const normalizeMediaPath = (path) =>
  withLeadingSlash(path)
    .replace(/^\/public(?=\/)/, "")
    .replace(/^\/compressed(?=\/)/, "");

export const mediaVariantUrl = (
  path,
  { width, version = MEDIA_VARIANT_VERSION } = {},
) => {
  if (!path || !MEDIA_VARIANT_WIDTHS.includes(Number(width))) {
    return "";
  }

  const mediaPath = normalizeMediaPath(path);
  if (!mediaPath.startsWith("/plantspic/")) {
    return "";
  }

  return `${apiOrigin}${encodeMediaPath(
    `/public/variants/${version}/${Number(width)}${mediaPath}.webp`,
  )}`;
};

export const responsiveMediaProps = (
  path,
  { sizes = "100vw", widths = MEDIA_VARIANT_WIDTHS } = {},
) => {
  if (!path) {
    return { src: "", fallbackSrc: [] };
  }

  const validWidths = [...new Set(widths.map(Number))]
    .filter((width) => MEDIA_VARIANT_WIDTHS.includes(width))
    .sort((left, right) => left - right);
  const candidates = validWidths
    .map((width) => [mediaVariantUrl(path, { width }), width])
    .filter(([url]) => url);

  if (candidates.length === 0) {
    return {
      src: mediaUrl(path, { compressed: true }),
      fallbackSrc: mediaUrl(path),
    };
  }

  return {
    src: candidates[candidates.length - 1][0],
    srcSet: candidates.map(([url, width]) => `${url} ${width}w`).join(", "),
    sizes,
    fallbackSrc: [mediaUrl(path, { compressed: true }), mediaUrl(path)],
  };
};

const urls = {
  // Admin-related URLs
  adminDataGet: apiUrl("/adminDataGet"),
  adminToggle: apiUrl("/adminToggle"),
  adminAuth: apiUrl("/adminAuth"),
  adminView: apiUrl("/adminView"),
  makeFeatured: apiUrl("/makeFeatured"),

  // User-related URLs
  login: apiUrl("/login"),
  logout: apiUrl("/logout"),
  register: apiUrl("/register"),
  userInfo: apiUrl("/userInfo"),
  userInfoGlossary: apiUrl("/userInfoGlossary"),
  userInfoGlossaryBird: apiUrl("/userInfoGlossaryBird"),

  // Creation-related URLs
  newCreationAuth: apiUrl("/newCreationAuth"),
  newBirdPostAuth: apiUrl("/newBirdPostAuth"),
  newPostAuth: apiUrl("/newPostAuth"),
  uploadCreation: apiUrl("/uploadCreation"),
  unFeatureCreation: apiUrl("/unFeatureCreation"),
  featureToHome: apiUrl("/featureToHome"),
  unFeatureHome: apiUrl("/unFeatureHome"),
  uploadHome: apiUrl("/uploadHome"),
  getPicsAndArts: apiUrl("/getPicsAndArts"),

  // Media-related URLs
  upload: apiUrl("/upload"),
  uploadPlant: apiUrl("/uploadPlant"),
  uploadBird: apiUrl("/uploadBird"),
  uploadPic: apiUrl("/uploadPic"),
  uploadBirdPic: apiUrl("/uploadBirdPic"),
  uploadArt: apiUrl("/uploadArt"),
  getPics: apiUrl("/getPics"),
  uploadFeatureSingle: apiUrl("/uploadFeatureSingle"),
  uploadFeatureArtSingle: apiUrl("/uploadFeatureArtSingle"),
  getDb2Pic: apiUrl("/getDb2Pic"),
  getDb2PicBird: apiUrl("/getDb2PicBird"),
  db2Alt: apiUrl("/db2Alt"),
  db2AltBird: apiUrl("/db2AltBird"),

  // Plant- and bird-related URLs
  numOfPlants: apiUrl("/numOfPlants"),
  numOfBirds: apiUrl("/numOfBirds"),
  syncPlantInfo: apiUrl("/syncPlantInfo"),
  syncBirdInfo: apiUrl("/syncBirdInfo"),
  editPageDelete: apiUrl("/editPageDelete"),
  editPageDeletePlant: apiUrl("/editPageDeletePlant"),
  birdUpdateText: apiUrl("/birdUpdateText"),

  // Miscellaneous URLs
  refresh: apiUrl("/refresh"),
  handleEditDecision: apiUrl("/handleEditDecision"),
  handleBirdEditDecision: apiUrl("/handleBirdEditDecision"),
  creationDocumentary: apiUrl("/creationDocumentary"),
  updateText: apiUrl("/updateText"),
  searchNames: apiUrl("/searchNames"),
  searchBirdNames: apiUrl("/searchBirdNames"),
  catalogNames: (type) => apiUrl(`/catalog/names?type=${type}`),
  searchTelemetry: apiUrl("/telemetry/search"),
};

export default urls;
