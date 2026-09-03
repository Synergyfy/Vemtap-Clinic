import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAuth } from './auth-state';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

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

          if (error.response?.status === 401 && !originalRequest._retry) {
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
              const response = await this.getClient().post('/auth/refresh');
              const newAccessToken = response.data.accessToken;

              if (newAccessToken) {
                this.processQueue(null, newAccessToken);
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return this.getClient()(originalRequest);
              }
            } catch (refreshError) {
              this.processQueue(refreshError as Error, '');
              clearAuth();
              if (typeof window !== 'undefined') {
                window.location.assign('/login');
              }
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