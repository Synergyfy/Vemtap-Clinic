import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAuth, useAuthState, normalizeAuthUser, type AuthUser } from './auth-state';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Set on calls that must act as the signed-in account itself, not as the
     * family profile currently selected in the UI. Used by the auth bootstrap
     * so the session identity is never overwritten by X-Patient-Id.
     */
    skipPatientProfileHeader?: boolean;
  }
}

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

export const isPublicAuthEndpoint = (url: string) => {
  const normalized = url.toLowerCase();

  return (
    normalized.includes('/auth/clinics') ||
    normalized.includes('/auth/login') ||
    normalized.includes('/auth/register') ||
    normalized.includes('/auth/forgot-password') ||
    normalized.includes('/auth/reset-password') ||
    normalized.includes('/auth/refresh') ||
    normalized.includes('/patient-portal/login') ||
    normalized.includes('/patient-portal/register') ||
    normalized.includes('/patient-portal/otp/') ||
    normalized.includes('/patient-portal/verify/')
  );
};

export const shouldSkipAuthHeader = (url: string) => {
  const normalized = url.toLowerCase();
  return isPublicAuthEndpoint(normalized);
};

const isPatientApiRequest = (url: string) => url.toLowerCase().includes('/patient-portal/');

export const ACTIVE_PATIENT_PROFILE_KEY = 'vemtap_active_profile';

const PATIENT_PROFILE_SWITCH_EXCLUSIONS = [
  '/patient-portal/login',
  '/patient-portal/register',
  '/patient-portal/refresh',
  '/patient-portal/logout',
  '/patient-portal/family',
  '/patient-portal/otp/',
  '/patient-portal/email-otp/',
];

export const ACTIVE_PATIENT_PROFILE_EVENT = 'vemtap:active-patient-profile-changed';

export interface ActivePatientProfile {
  id: string;
  name?: string;
  fullName?: string;
  role?: string;
}

export const setActivePatientProfile = (profile: ActivePatientProfile | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (!profile) {
      window.localStorage.removeItem(ACTIVE_PATIENT_PROFILE_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_PATIENT_PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    // ignore storage failures (private mode, quota)
  }
  window.dispatchEvent(new Event(ACTIVE_PATIENT_PROFILE_EVENT));
};

export const subscribeToActivePatientProfile = (onChange: () => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACTIVE_PATIENT_PROFILE_KEY) onChange();
  };

  window.addEventListener(ACTIVE_PATIENT_PROFILE_EVENT, onChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(ACTIVE_PATIENT_PROFILE_EVENT, onChange);
    window.removeEventListener('storage', handleStorage);
  };
};

export const getActivePatientProfileId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ACTIVE_PATIENT_PROFILE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const id = typeof parsed === 'string' ? parsed : parsed?.id;
    return typeof id === 'string' && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
};

// Patient auth endpoints must never trigger a refresh-and-retry loop.
const PATIENT_NO_REFRESH_ENDPOINTS = [
  '/patient-portal/login',
  '/patient-portal/register',
  '/patient-portal/refresh',
  '/patient-portal/family/activate',
  '/patient-portal/otp/',
  '/patient-portal/email-otp/',
];

const patientToAuthUser = (patient: Record<string, any> | null | undefined): AuthUser | null => {
  if (!patient?.id) return null;

  return normalizeAuthUser({
    userId: patient.id,
    email: patient.email ?? '',
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    roles: ['patient'],
    clinicId: patient.clinicId ?? '',
    branchId: patient.branchId ?? undefined,
    guardianId: patient.guardianId ?? undefined,
    guardianRelationship: patient.guardianRelationship ?? undefined,
    accountType: patient.accountType,
  });
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

          if (config.params) {
            config.params = sanitizeNullishValues(config.params) as Record<string, unknown>;
          }

          if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
            config.data = sanitizeNullishValues(config.data) as typeof config.data;
          }

          if (shouldSkipAuthHeader(url)) {
            return config;
          }

          const token = getAccessToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }

          const normalizedRequestUrl = url.toLowerCase();
          const isPatientProfileScopedRequest =
            isPatientApiRequest(url) || normalizedRequestUrl.includes('/notifications');
          const isPatientSession =
            Array.isArray(useAuthState.getState().user?.roles) &&
            useAuthState.getState().user!.roles.includes('patient');

          if (
            isPatientProfileScopedRequest &&
            !config.skipPatientProfileHeader &&
            isPatientSession &&
            !PATIENT_PROFILE_SWITCH_EXCLUSIONS.some((endpoint) => normalizedRequestUrl.includes(endpoint))
          ) {
            const activePatientId = getActivePatientProfileId();
            if (activePatientId) {
              config.headers['X-Patient-Id'] = activePatientId;
            }
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
          const normalizedUrl = url.toLowerCase();
          const isPatientRequest = isPatientApiRequest(url);
          const isAuthEndpoint =
            url.includes('/auth/refresh') ||
            url.includes('/auth/login') ||
            url.includes('/auth/logout') ||
            url.includes('/patient-portal/logout') ||
            PATIENT_NO_REFRESH_ENDPOINTS.some((endpoint) => normalizedUrl.includes(endpoint));

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
              // Use plain axios call to avoid self-intercepting 401 into an infinite loop.
              // Patients have their own refresh cookie/endpoint; staff use /auth/refresh.
              const refreshUrl = isPatientRequest ? `${API_URL}/patient-portal/refresh` : `${API_URL}/auth/refresh`;
              const response = await axios.post(refreshUrl, {}, { withCredentials: true });
              const newAccessToken = response.data?.accessToken;
              const refreshedUser = isPatientRequest
                ? patientToAuthUser(response.data?.patient) ?? useAuthState.getState().user
                : response.data?.user ?? useAuthState.getState().user;

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