// src/crud/auth.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { StorageService } from '@/services/StorageService';
import { doRefresh } from '@/services/AuthServices';

// Cambia a true para tu server local (Android emulador usa 10.0.2.2)
const useLocalServer = true;
const LOCAL_URL = 'http://10.0.2.2:8000';
const PROD_URL = 'https://tu-servidor.com';

export const BASE_URL = useLocalServer ? LOCAL_URL : PROD_URL;

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// ===== Request: inyecta Authorization =====
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await StorageService.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Response: manejo 401 con cola =====
let isRefreshing = false;
let subscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => subscribers.push(cb);
const onRefreshed = (token: string | null) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.response?.status !== 401 || original?._retry) {
      throw error;
    }
    original._retry = true;

    if (isRefreshing) {
      const newToken = await new Promise<string | null>((resolve) => {
        subscribeTokenRefresh(resolve);
      });

      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } else {
        await StorageService.clearSession();
        throw error;
      }
    }

    isRefreshing = true;
    try {
      const data = await doRefresh(); // { access_token, ... }
      const newAccess = data?.access_token ?? null;
//ola
      onRefreshed(newAccess);
      return api(original);
    } catch (e) {
      onRefreshed(null);
      await StorageService.clearSession();
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
