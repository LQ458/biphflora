export const apiOrigin = (process.env.REACT_APP_Source_URL || "").replace(
  /\/+$/,
  "",
);

const withLeadingSlash = (path) => {
  const value = String(path ?? "");
  return value.startsWith("/") ? value : `/${value}`;
};

export const apiUrl = (path = "") => `${apiOrigin}${withLeadingSlash(path)}`;

export const mediaUrl = (path, { compressed = false } = {}) => {
  if (!path) {
    return "";
  }

  const mediaPath = withLeadingSlash(path).replace(/^\/public(?=\/)/, "");
  const normalizedPath = compressed
    ? mediaPath.replace(/^\/compressed(?=\/)/, "")
    : mediaPath;

  return apiUrl(`/public${compressed ? "/compressed" : ""}${normalizedPath}`);
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
