import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get base URL from environment or localStorage
export const getGatewayBaseUrl = (): string => {
  const custom = localStorage.getItem('examguard_gateway_url');
  if (custom) return custom;
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

export const isDemoModeActive = (): boolean => {
  const stored = localStorage.getItem('examguard_demo_mode');
  if (stored !== null) {
    return stored === 'true';
  }
  return import.meta.env.VITE_DEMO_MODE !== 'false';
};

// Create standard Axios client configured for Spring Cloud Gateway
export const apiClient: AxiosInstance = axios.create({
  baseURL: getGatewayBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Interceptor for JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Dynamically update baseURL if changed in settings
    config.baseURL = getGatewayBaseUrl();

    const token = localStorage.getItem('examguard_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for 401/403 security handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Dispatch custom event for expired session
      window.dispatchEvent(new CustomEvent('examguard:auth_expired'));
    }
    return Promise.reject(error);
  }
);
