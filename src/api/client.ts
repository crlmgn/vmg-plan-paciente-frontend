import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./tokens";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const access = getAccessToken();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Callback opcional para que la app reaccione a una sesión vencida (ej.
// redirigir a /login) sin que este módulo dependa de react-router.
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(callback: () => void): void {
  onSessionExpired = callback;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = originalRequest?.url?.includes("/auth/token/");

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retried || isAuthEndpoint) {
      throw error;
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      onSessionExpired?.();
      throw error;
    }

    try {
      const { data } = await axios.post<{ access: string }>(`${API_URL}/auth/token/refresh/`, {
        refresh,
      });
      setAccessToken(data.access);
      originalRequest._retried = true;
      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      onSessionExpired?.();
      throw refreshError;
    }
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if ("detail" in data && typeof data.detail === "string") return data.detail;
      // DRF suele devolver { campo: ["mensaje"] } en errores de validación.
      const firstField = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstField) && typeof firstField[0] === "string") {
        return firstField[0];
      }
    }
  }
  return "Ocurrió un error inesperado. Intentá de nuevo.";
}
