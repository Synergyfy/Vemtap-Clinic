import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAuth, useAuthState } from './auth-state';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const shouldDropEmptyIdValue = (key?: string) => {
  if (!key) return false;
  const normalized = key.toLowerCase();
  return normalized === 'clinicid' || normalized === 'branchid' || normalized.endsWith('id');
};

const sanitizeNullishValues = (value: unknown, key?: string): unknown => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'string' && value.trim() === '' && shouldDropEmptyIdValue(key)) {
    return undefined;
  }

  if (value instanceof FormData || value instanceof URLSearchParams || value instanceof Blob) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeNullishValues(item, key))
      .filter((item) => item !== undefined);
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [entryKey, item]) => {
      const sanitized = sanitizeNullishValues(item, entryKey);
      if (sanitized !== undefined) {
        acc[entryKey] = sanitized;
      }
      return acc;
    }, {});
  }

  return value;
};

class ApiClient {
  private client: AxiosInstance | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private getClient(): AxiosInstance {
    if (!this.client) {
      this.client = axios.create({
        baseURL: API_URL,
        timeout: 30000,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const url = config.url || '';
          const isPublicAuthEndpoint =
            url.includes('/auth/clinics') ||
            url.includes('/auth/login') ||
            url.includes('/auth/register') ||
            url.includes('/auth/refresh');

          if (config.params) {
            config.params = sanitizeNullishValues(config.params) as Record<string, unknown>;
          }

          if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data = sanitizeNullishValues(config.data) as typeof config.data;
          }

          if (isPublicAuthEndpoint) {
            return config;
          }

          const token = getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error),
      );

      this.client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
          const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

          const url = originalRequest.url || '';
          const isAuthEndpoint = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/logout');

          if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              })
                .then((token) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                  }
                  return this.getClient()(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              // Use plain axios call to avoid self-intercepting 401 into an infinite loop
              const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
              const newAccessToken = response.data?.accessToken;
              const refreshedUser = response.data?.user ?? useAuthState.getState().user;

              if (newAccessToken && refreshedUser) {
                useAuthState.getState().setAuth(newAccessToken, refreshedUser);
                this.processQueue(null, newAccessToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return this.getClient()(originalRequest);
              }

              if (newAccessToken) {
                const currentUser = useAuthState.getState().user;
                if (currentUser) {
                  useAuthState.getState().setAuth(newAccessToken, currentUser);
                }
                this.processQueue(null, newAccessToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return this.getClient()(originalRequest);
              }
            } catch (refreshError) {
              this.processQueue(refreshError as Error, '');
              clearAuth();
              return Promise.reject(refreshError);
            } finally {
              this.isRefreshing = false;
            }
          }

          return Promise.reject(error);
        },
      );
    }
    return this.client;
  }

  private processQueue(error: Error | null, token: string) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  get = async (...args: Parameters<AxiosInstance['get']>) => this.getClient().get(...args);
  post = async (...args: Parameters<AxiosInstance['post']>) => this.getClient().post(...args);
  put = async (...args: Parameters<AxiosInstance['put']>) => this.getClient().put(...args);
  patch = async (...args: Parameters<AxiosInstance['patch']>) => this.getClient().patch(...args);
  delete = async (...args: Parameters<AxiosInstance['delete']>) => this.getClient().delete(...args);
}

export const api = new ApiClient();