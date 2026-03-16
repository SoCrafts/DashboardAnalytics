import axios from "axios";

// Vite exposes env vars on import.meta.env.* (only variables prefixed with VITE_ are injected).
// In production, prefer deploying the SPA + API under the same origin and use a relative "/api" base URL.
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || "/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});