// src/api/auth_api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLocalServer = true;
const LOCAL_URL = 'http://10.0.2.2:8000'; 
const PROD_URL = 'https://tu-servidor.com';
export const BASE_URL = useLocalServer ? LOCAL_URL : PROD_URL;

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  middle_name?: string;
  last_name?: string;
  dob?: string;
  group_uuid?: string | null;
  voice_id?: string | null;
  email_verified?: boolean;
  created_at?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ChangePasswordBody {
  old_password: string;
  new_password: string;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

const ACCESS_KEY = '@auth/access_token';
const REFRESH_KEY = '@auth/refresh_token';
const USER_KEY   = '@auth/user';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const access = await AsyncStorage.getItem(ACCESS_KEY);
  if (access && config.headers) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  pendingQueue.forEach(cb => cb(token));
  pendingQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = (error.response && error.response.status) || 0;

    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newAccess) => {
          if (!newAccess) return reject(error);
          if (!original.headers) original.headers = {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          resolve(api(original));
        });
      });
    }

    try {
      isRefreshing = true;
      const newTokens = await doRefresh(); 
      processQueue(newTokens?.access_token ?? null);

      if (!original.headers) original.headers = {};
      original.headers.Authorization = `Bearer ${newTokens?.access_token}`;
      return api(original);
    } catch (e) {
      processQueue(null);
      await clearSession();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

// ===== Helpers de sesión =====
export async function saveSession(tokens: TokenPairResponse) {
  await AsyncStorage.multiSet([
    [ACCESS_KEY, tokens.access_token],
    [REFRESH_KEY, tokens.refresh_token],
    [USER_KEY, JSON.stringify(tokens.user)],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY]);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_KEY);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_KEY);
}

export async function getUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ===== Endpoints Auth =====
export async function login(body: LoginBody): Promise<AuthUser> {
  const { data } = await axios.post<TokenPairResponse>(`${BASE_URL}/auth/login`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  await saveSession(data);
  return data.user;
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me');
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await api.post('/auth/change-password', body, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function logoutAccess(): Promise<void> {
  try {
    await api.post('/auth/logout/access');
  } finally {
    await clearSession();
  }
}

export async function logoutRefresh(): Promise<void> {
  try {
    const refresh = await getRefreshToken();
    await axios.post(`${BASE_URL}/auth/logout/refresh`, null, {
      headers: { Authorization: `Bearer ${refresh}` },
    });
  } finally {
    await clearSession();
  }
}

// ===== Refresh interno =====
async function doRefresh(): Promise<{ access_token: string; refresh_token: string } | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const { data } = await axios.post<TokenPairResponse>(`${BASE_URL}/auth/refresh`, null, {
    headers: { Authorization: `Bearer ${refresh}` },
  });

  // guardamos nuevos tokens
  await AsyncStorage.multiSet([
    [ACCESS_KEY, data.access_token],
    [REFRESH_KEY, data.refresh_token],
  ]);
  return { access_token: data.access_token, refresh_token: data.refresh_token };
}

export default api;
