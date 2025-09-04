// src/crud/auth.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { StorageService } from '@/services/StorageService';
import { doRefresh } from '@/services/AuthServices';

// Cambia a true para tu server local (Android emulador usa 10.0.2.2)
const useLocalServer = false;
const LOCAL_URL = 'http://10.0.2.2:8000';
const PROD_URL = 'https://backend-vocare-production.up.railway.app';

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



export default api;
