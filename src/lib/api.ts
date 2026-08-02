import axios, { AxiosError } from "axios";

import { env } from "@/env";

const API_URL = env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // For httpOnly cookie refresh token
  timeout: 30000,
});

// ─── Request Interceptor ──────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Attach access token from localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach tenant slug if available
    const tenantSlug = localStorage.getItem("tenantSlug");
    if (tenantSlug) {
      config.headers["x-tenant-slug"] = tenantSlug;
    }
  }
  return config;
});

// ─── Response Interceptor (Token Refresh) ────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post("/auth/refresh", {});
        const { accessToken } = data.data;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("tenantSlug");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
