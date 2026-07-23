import axios from "axios";
import { apiOrigin } from "../tools/url";

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("askanything");
  const isApiRequest =
    apiOrigin &&
    (config.url === apiOrigin || config.url?.startsWith(`${apiOrigin}/`));

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
