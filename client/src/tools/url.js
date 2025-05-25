const prefix = process.env.REACT_APP_Source_URL;

const urls = {
  // Admin-related URLs
  adminDataGet: `${prefix}/adminDataGet`,
  adminToggle: `${prefix}/adminToggle`,
  adminAuth: `${prefix}/adminAuth`,
  adminView: `${prefix}/adminView`,

  // User-related URLs
  login: `${prefix}/login`,
  logout: `${prefix}/logout`,
  userInfo: `${prefix}/userInfo`,
  userInfoGlossary: `${prefix}/userInfoGlossary`,

  // Creation-related URLs
  newCreationAuth: `${prefix}/newCreationAuth`,
  newPostAuth: `${prefix}/newPostAuth`,
  uploadCreation: `${prefix}/uploadCreation`,
  unFeatureCreation: `${prefix}/unFeatureCreation`,
  featureToHome: `${prefix}/featureToHome`,
  unFeatureHome: `${prefix}/unFeatureHome`,

  // Media-related URLs
  upload: `${prefix}/upload`,
  uploadPic: `${prefix}/uploadPic`,
  uploadArt: `${prefix}/uploadArt`,
  getPics: `${prefix}/getPics`,
  uploadFeatureSingle: `${prefix}/uploadFeatureSingle`,
  getDb2Pic: `${prefix}/getDb2Pic`,
  db2Alt: `${prefix}/db2Alt`,

  // Plant-related URLs
  numOFPlants: `${prefix}/numOFPlants`,
  syncPlantInfo: `${prefix}/syncPlantInfo`,
  editPageDelete: `${prefix}/editPageDelete`,
  editPageDeletePlant: `${prefix}/editPageDeletePlant`,

  // Miscellaneous URLs
  refresh: `${prefix}/refresh`,
  handleEditDecision: `${prefix}/handleEditDecision`,
  creationDocumentary: `${prefix}/creationDocumentary`,
  updateText: `${prefix}/updateText`,
  searchNames: `${prefix}/searchNames`,
};

export default urls;
