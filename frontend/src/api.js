import axios from "axios";

// Base URL should be the server root.
// Individual calls will include the `/api/...` prefix.
const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const role = localStorage.getItem('userRole');
  if (role) {
    config.headers['x-user-role'] = role;
  }
  return config;
});

export default api;
