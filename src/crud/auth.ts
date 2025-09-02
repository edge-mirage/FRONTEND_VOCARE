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

// ✅ AGREGAR ESTAS INTERFACES AL FINAL
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  relationship: string;
  group_uuid?: string | null;
}

export interface VerifyEmailBody {
  email: string;
  code: string;
}

export interface ResendVerificationBody {
  email: string;
}

// ✅ FUNCIÓN DE REGISTRO
export async function register(body: RegisterBody): Promise<any> {
  console.log('🌐 [REGISTER API] Enviando request a:', `${BASE_URL}/auth/register`);
  console.log('📤 [REGISTER API] Body:', { 
    ...body, 
    password: '***' 
  });
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    
    console.log('✅ [REGISTER API] Response status:', response.status);
    console.log('✅ [REGISTER API] Response data:', response.data);
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [REGISTER API] Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error en el registro';
      
      if (error.response?.status === 409) {
        throw new Error('El email ya está registrado');
      } else if (error.response?.status === 404) {
        throw new Error('El código de grupo familiar no es válido');
      } else if (error.response?.status === 400) {
        if (errorMessage.includes('email ya está registrado')) {
          throw new Error('El email ya está registrado');
        } else if (errorMessage.includes('código de grupo familiar')) {
          throw new Error('El código de grupo familiar no es válido');
        } else if (errorMessage.includes('Relación no válida')) {
          throw new Error('Relación familiar no válida. Selecciona una opción válida.');
        }
        throw new Error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ✅ FUNCIÓN DE VERIFICACIÓN DE EMAIL
export async function verifyEmail(body: VerifyEmailBody): Promise<any> {
  console.log('🌐 [VERIFY EMAIL API] Enviando request a:', `${BASE_URL}/users/verify-email`);
  console.log('📤 [VERIFY EMAIL API] Body:', body);
  
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-email`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    
    console.log('✅ [VERIFY EMAIL API] Response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [VERIFY EMAIL API] Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 'Código de verificación inválido';
      
      if (error.response?.status === 400) {
        if (errorMessage.includes('inválido') || errorMessage.includes('expirado')) {
          throw new Error('Código de verificación inválido o expirado');
        }
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      }
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ✅ FUNCIÓN DE REENVÍO DE CÓDIGO
export async function resendVerification(body: ResendVerificationBody): Promise<any> {
  console.log('🌐 [RESEND VERIFICATION API] Enviando request a:', `${BASE_URL}/users/resend-verification`);
  console.log('📤 [RESEND VERIFICATION API] Body:', body);
  
  try {
    const response = await axios.post(`${BASE_URL}/users/resend-verification`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    
    console.log('✅ [RESEND VERIFICATION API] Response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [RESEND VERIFICATION API] Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 'Error reenviando código';
      
      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado');
      } else if (error.response?.status === 400) {
        if (errorMessage.includes('ya está verificado')) {
          throw new Error('El email ya está verificado');
        }
        throw new Error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ✅ FUNCIÓN DE LOGOUT (si no existe)
export async function logoutAccess(): Promise<any> {
  console.log('🌐 [LOGOUT API] Enviando request a:', `${BASE_URL}/auth/logout/access`);
  
  try {
    const token = await StorageService.getAccessToken();
    
    if (!token) {
      console.log('⚠️ [LOGOUT API] No hay token para hacer logout');
      return { message: 'No hay sesión activa' };
    }
    
    const response = await axios.post(`${BASE_URL}/auth/logout/access`, {}, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000,
    });
    
    console.log('✅ [LOGOUT API] Response:', response.data);
    
    // Limpiar tokens localmente
    await StorageService.removeAccessToken();
    await StorageService.removeRefreshToken();
    
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [LOGOUT API] Error:', error);
    
    // Aún si falla el logout del servidor, limpiar tokens localmente
    try {
      await StorageService.removeAccessToken();
      await StorageService.removeRefreshToken();
      console.log('✅ [LOGOUT API] Tokens locales limpiados');
    } catch (storageError) {
      console.error('❌ [LOGOUT API] Error limpiando storage:', storageError);
    }
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 'Error cerrando sesión';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ✅ FUNCIÓN DE VERIFICACIÓN DE TOKEN (si no existe)
export async function verifyToken(): Promise<any> {
  console.log('🌐 [VERIFY TOKEN API] Enviando request a:', `${BASE_URL}/auth/verify-token`);
  
  try {
    const token = await StorageService.getAccessToken();
    
    if (!token) {
      throw new Error('No hay token para verificar');
    }
    
    const response = await axios.post(`${BASE_URL}/auth/verify-token`, {}, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000,
    });
    
    console.log('✅ [VERIFY TOKEN API] Token válido');
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [VERIFY TOKEN API] Token inválido:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 'Token inválido';
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

// ✅ FUNCIÓN DE RECUPERAR CONTRASEÑA (si no existe)
export interface RecoverPasswordBody {
  email: string;
}

export async function recoverPassword(body: RecoverPasswordBody): Promise<any> {
  console.log('🌐 [RECOVER PASSWORD API] Enviando request a:', `${BASE_URL}/users/recover-password`);
  console.log('📤 [RECOVER PASSWORD API] Body:', body);
  
  try {
    const response = await axios.post(`${BASE_URL}/users/recover-password`, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });
    
    console.log('✅ [RECOVER PASSWORD API] Response:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ [RECOVER PASSWORD API] Error:', error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.detail || 'Error enviando código de recuperación';
      
      if (error.response?.status === 404) {
        throw new Error('Email no encontrado');
      }
      
      throw new Error(errorMessage);
    }
    
    throw error;
  }
}

export default api;

