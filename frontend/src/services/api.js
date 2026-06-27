import axios from "axios";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  `http://${window.location.hostname}:5000/api`;

const API = axios.create({
  baseURL: apiBaseUrl,
});

export const getAssetUrl = (path) => {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${apiBaseUrl.replace(/\/api\/?$/, "")}${path}`;
};

export default API;
