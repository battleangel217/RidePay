import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/jwt/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `JWT ${data.access}`;
          return client(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
