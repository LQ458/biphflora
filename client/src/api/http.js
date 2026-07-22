import axios from "axios";

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("askanything");
  const apiBaseUrl = process.env.REACT_APP_Source_URL;
  const normalizedApiBaseUrl = apiBaseUrl?.replace(/\/$/, "");
  const isApiRequest =
    normalizedApiBaseUrl &&
    (config.url === normalizedApiBaseUrl ||
      config.url?.startsWith(`${normalizedApiBaseUrl}/`));

  if (!token || !isApiRequest) {
    return config;
  }

  const headers = config.headers || {};
  if (!headers.authorization && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  config.headers = headers;

  return config;
});

export default axios;
