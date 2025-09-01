// src/api/auth_api.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLocalServer = true; // Cambiado a true para usar el servidor local
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

// Interceptor de request corregido
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
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

// Interceptor de response corregido
api.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = (error.response && error.response.status) || 0;

    if (status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((newAccess) => {
          if (!newAccess) return reject(error);
          if (original.headers) {
            original.headers.Authorization = `Bearer ${newAccess}`;
          }
          resolve(api(original));
        });
      });
    }

    try {
      isRefreshing = true;
      const newTokens = await doRefresh(); 
      processQueue(newTokens?.access_token ?? null);

      if (original.headers) {
        original.headers.Authorization = `Bearer ${newTokens?.access_token}`;
      }
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
  try {
    console.log('💾 SAVE SESSION: Iniciando guardado de sesión...');
    console.log('💾 SAVE SESSION: Tokens recibidos:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      hasUser: !!tokens.user,
      userId: tokens.user?.id
    });
    
    const dataToSave: [string, string][] = [
      [ACCESS_KEY, tokens.access_token],
      [REFRESH_KEY, tokens.refresh_token],
      [USER_KEY, JSON.stringify(tokens.user)],
    ];
    
    console.log('💾 SAVE SESSION: Guardando en AsyncStorage...');
    await AsyncStorage.multiSet(dataToSave);
    console.log('✅ SAVE SESSION: Datos guardados exitosamente');
    
    // Verificar que se guardó correctamente
    const savedUser = await AsyncStorage.getItem(USER_KEY);
    console.log('🔍 SAVE SESSION: Verificación - usuario guardado:', savedUser ? 'SÍ' : 'NO');
    
  } catch (error) {
    console.error('❌ SAVE SESSION: Error guardando sesión:', error);
    throw error;
  }
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
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') {
      console.log('📭 No hay usuario almacenado o es null/undefined');
      return null;
    }
    
    const user = JSON.parse(raw);
    
    // Validar que el usuario tenga las propiedades mínimas requeridas
    if (!user || !user.id || !user.email) {
      console.warn('⚠️ Usuario almacenado no tiene propiedades válidas:', user);
      return null;
    }
    
    console.log('👤 Usuario obtenido de AsyncStorage:', user);
    return user;
  } catch (error) {
    console.error('❌ Error obteniendo usuario:', error);
    return null;
  }
}

// ===== Endpoints Auth =====
export async function login(body: LoginBody): Promise<AuthUser> {
  console.log('🌐 LOGIN API: Enviando request a:', `${BASE_URL}/auth/login`);
  console.log('📤 LOGIN API: Body:', { email: body.email, password: '***' });
  
  try {
    console.log('🔄 LOGIN API: Haciendo request...');
    const response = await axios.post(`${BASE_URL}/auth/login`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    
    console.log('✅ LOGIN API: Response status:', response.status);
    console.log('✅ LOGIN API: Response data (raw):', JSON.stringify(response.data, null, 2));
    
    const data = response.data;
    
    // Caso 1: Estructura completa (nueva implementación)
    if (data.access_token && data.refresh_token && data.user) {
      console.log('✅ LOGIN API: Estructura completa detectada');
      
      const tokenData: TokenPairResponse = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type || 'bearer',
        user: data.user
      };
      
      await saveSession(tokenData);
      console.log('💾 LOGIN API: Sesión guardada correctamente');
      return tokenData.user;
    }
    // Caso 2: Solo user_id (implementación anterior)
    else if (data.user_id) {
      console.log('🔄 LOGIN API: Estructura antigua detectada - adaptando...');
      
      const user: AuthUser = {
        id: data.user_id,
        email: body.email,
        name: body.email.split('@')[0],
        email_verified: true,
        created_at: new Date().toISOString()
      };
      
      const tokenData: TokenPairResponse = {
        access_token: `temp_token_${data.user_id}_${Date.now()}`,
        refresh_token: `temp_refresh_${data.user_id}_${Date.now()}`,
        token_type: 'bearer',
        user: user
      };
      
      await saveSession(tokenData);
      console.log('💾 LOGIN API: Sesión adaptada guardada');
      return user;
    }
    else {
      console.error('❌ LOGIN API: Respuesta no tiene estructura esperada');
      console.error('❌ LOGIN API: Datos recibidos:', data);
      throw new Error('Respuesta del servidor no tiene la estructura esperada');
    }
    
  } catch (error: any) {
    console.error('❌ LOGIN API: Error completo:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('❌ LOGIN API: Es error de Axios');
      console.error('❌ LOGIN API: Status:', error.response?.status);
      console.error('❌ LOGIN API: Data:', error.response?.data);
      
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || '';
      
      // ✅ Manejar errores específicos del backend con códigos correctos
      if (error.response?.status === 423) {  // ← Cambiar de 403 a 423
        // Error de cuenta bloqueada
        if (errorMessage.includes('bloqueada') || errorMessage.includes('blocked')) {
          const match = errorMessage.match(/(\d+)\s*minutos?/);
          const minutes = match ? match[1] : '10';
          
          const customError = new Error(errorMessage);
          (customError as any).isBlocked = true;
          (customError as any).blockedMinutes = minutes;
          (customError as any).response = error.response;
          throw customError;
        }
      } else if (error.response?.status === 403) {
        // Error de intentos fallidos pero no bloqueado aún
        if (errorMessage.includes('Te quedan') || errorMessage.includes('intentos')) {
          const attemptsMatch = errorMessage.match(/Te quedan (\d+) intentos?/);
          const remainingAttempts = attemptsMatch ? attemptsMatch[1] : '0';
          
          const customError = new Error(errorMessage);
          (customError as any).isFailedAttempt = true;
          (customError as any).remainingAttempts = remainingAttempts;
          (customError as any).response = error.response;
          throw customError;
        }
      } else if (error.response?.status === 422) {
        // Email no verificado
        const customError = new Error(errorMessage || 'Email no verificado');
        (customError as any).isEmailNotVerified = true;
        (customError as any).response = error.response;
        throw customError;
      } else if (error.response?.status === 401) {
        // Credenciales incorrectas (contraseña incorrecta)
        const customError = new Error(errorMessage || 'Contraseña incorrecta');
        (customError as any).isWrongPassword = true;
        (customError as any).response = error.response;
        throw customError;
      } else if (error.response?.status === 404) {
        // Usuario no encontrado
        const customError = new Error('Usuario no encontrado');
        (customError as any).isUserNotFound = true;
        (customError as any).response = error.response;
        throw customError;
      }
      
      // Si es 404, intentar con rutas alternativas
      if (error.response?.status === 404) {
        console.log('🔄 LOGIN API: Intentando rutas alternativas...');
        const alternativeRoutes = ['/login', '/api/auth/login', '/users/login', '/auth/signin'];
        
        for (const route of alternativeRoutes) {
          try {
            console.log(`🔄 LOGIN API: Intentando: ${BASE_URL}${route}`);
            const altResponse = await axios.post(`${BASE_URL}${route}`, body, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 10000,
            });
            
            console.log(`✅ LOGIN API: Éxito con ruta alternativa: ${route}`);
            
            // Aplicar la misma lógica de procesamiento
            const altData = altResponse.data;
            
            if (altData.access_token && altData.user) {
              const tokenData: TokenPairResponse = {
                access_token: altData.access_token,
                refresh_token: altData.refresh_token,
                token_type: altData.token_type || 'bearer',
                user: altData.user
              };
              await saveSession(tokenData);
              return tokenData.user;
            } else if (altData.user_id) {
              const user: AuthUser = {
                id: altData.user_id,
                email: body.email,
                name: body.email.split('@')[0],
                email_verified: true,
                created_at: new Date().toISOString()
              };
              const tokenData: TokenPairResponse = {
                access_token: `temp_token_${altData.user_id}_${Date.now()}`,
                refresh_token: `temp_refresh_${altData.user_id}_${Date.now()}`,
                token_type: 'bearer',
                user: user
              };
              await saveSession(tokenData);
              return user;
            }
            
          } catch (altError: any) {
            console.log(`❌ LOGIN API: Falló ruta ${route}:`, axios.isAxiosError(altError) ? altError.response?.status : altError);
          }
        }
      }
    }
    
    throw error;
  }
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
    if (refresh) {
      await axios.post(`${BASE_URL}/auth/logout/refresh`, null, {
        headers: { Authorization: `Bearer ${refresh}` },
      });
    }
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

