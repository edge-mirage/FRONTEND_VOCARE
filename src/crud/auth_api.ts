// src/api/auth_api.ts
import api, { BASE_URL } from '@/crud/auth';
import { StorageService } from '@/services/StorageService';
import type { MinimalUser } from '@/services/StorageService';
import axios from 'axios';

// ===== Interfaces =====
export interface AuthUser extends MinimalUser {
  id: number;              // requerido
  email: string;           // requerido
  name: string;
  middle_name?: string;
  last_name?: string;
  dob?: string;
  email_verified?: boolean;
  created_at?: string;
}

export interface CaregiverRoleBody {
  is_primary: boolean; // true = cuidador/a principal, false = no
}

export interface LoginBody { email: string; password: string; }
export interface ChangePasswordBody { old_password: string; new_password: string; }
export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  user: AuthUser;
}

// ===== Helpers de sesión (vía StorageService) =====
export async function saveSession(tokens: TokenPairResponse) {
  await StorageService.setAccessToken(tokens.access_token);
  await StorageService.setRefreshToken(tokens.refresh_token);
  await StorageService.setUser(tokens.user);
  await StorageService.initializeFromUser(tokens.user);
}

export async function clearSession() {
  await StorageService.clearAppData();
}

export async function getAccessToken() {
  return StorageService.getAccessToken();
}

export async function getRefreshToken() {
  return StorageService.getRefreshToken();
}

export async function getUser(): Promise<AuthUser | null> {
  return StorageService.getUser<AuthUser>();
}

export async function setCaregiverRole(body: CaregiverRoleBody) {
  const { data } = await api.post('/users/caregiver-role', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}

// ===== Endpoints Auth =====
export async function register(body: RegisterBody) {
  console.log('🌐 [REGISTER] Iniciando registro...');
  console.log('🌐 [REGISTER] BASE_URL:', BASE_URL);
  console.log('🌐 [REGISTER] URL completa:', `${BASE_URL}/auth/register`);
  console.log('📤 [REGISTER] Body:', { ...body, password: '***' });
  
  try {
    // ✅ USAR AXIOS DIRECTO PARA ASEGURAR LA URL
    const response = await axios.post(`${BASE_URL}/auth/register`, body, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000,
    });
    
    console.log('✅ [REGISTER] Response status:', response.status);
    console.log('✅ [REGISTER] Response data:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.log('❌ [REGISTER] Error completo:', error);
    console.log('❌ [REGISTER] Error message:', error.message);
    console.log('❌ [REGISTER] Error response:', error.response?.data);
    console.log('❌ [REGISTER] Error status:', error.response?.status);
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('Error de conexión. Verifica que el servidor esté corriendo en http://10.0.2.2:8000');
    }
    
    throw error;
  }
}

export async function login(body: LoginBody): Promise<AuthUser> {
  console.log('🌐 [LOGIN] Iniciando login...');
  console.log('🌐 [LOGIN] BASE_URL:', BASE_URL);
  console.log('🌐 [LOGIN] URL completa:', `${BASE_URL}/auth/login`);
  console.log('📤 [LOGIN] Body:', { email: body.email, password: '***' });
  
  try {
    const response = await axios.post<TokenPairResponse>(`${BASE_URL}/auth/login`, body, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000,
    });

    console.log('✅ [LOGIN] Response status:', response.status);
    console.log('✅ [LOGIN] Response data:', response.data);

    const data = response.data;
    
    if (data?.access_token && data?.refresh_token && data?.user) {
      await saveSession(data);
      return data.user;
    }

    if ((data as any)?.user_id) {
      const user: AuthUser = {
        id: (data as any).user_id,
        email: body.email,
        name: body.email.split('@')[0],
        email_verified: true,
        created_at: new Date().toISOString(),
      };
      const temp: TokenPairResponse = {
        access_token: `temp_${user.id}_${Date.now()}`,
        refresh_token: `temp_r_${user.id}_${Date.now()}`,
        token_type: 'bearer',
        user,
      };
      await saveSession(temp);
      return user;
    }

    throw new Error('Respuesta del servidor no tiene la estructura esperada');
    
  } catch (error: any) {
    console.log('❌ [LOGIN] Error completo:', error);
    console.log('❌ [LOGIN] Error message:', error.message);
    console.log('❌ [LOGIN] Error response:', error.response?.data);
    console.log('❌ [LOGIN] Error status:', error.response?.status);
    
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('Error de conexión. Verifica que el servidor esté corriendo en http://10.0.2.2:8000');
    }
    
    throw error;
  }
}

export async function me(): Promise<AuthUser> {
  const { data } = await api.get<{ user: AuthUser }>('/auth/me');
  await StorageService.setUser(data.user);
  await StorageService.initializeFromUser(data.user);
  return data.user;
}

export async function changePassword(body: ChangePasswordBody): Promise<void> {
  await api.post('/auth/change-password', body, {
    headers: { 'Content-Type': 'application/json' },
  });
}

// ===== Registro / verificación / recuperación =====
export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  relationship: string;
  group_uuid?: string | null;
}
export interface VerifyEmailBody { email: string; code: string; }
export interface ResendVerificationBody { email: string; }
export interface RecoverPasswordBody { email: string; }

export async function verifyEmail(body: VerifyEmailBody) {
  const { data } = await api.post('/users/verify-email', body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return data;
}

export async function resendVerification(body: ResendVerificationBody) {
  const { data } = await api.post('/users/resend-verification', body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return data;
}

export async function recoverPassword(body: RecoverPasswordBody) {
  const { data } = await api.post('/users/recover-password', body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });
  return data;
}

// ===== Logout / verify token =====
export async function logoutAccess() {
  const token = await StorageService.getAccessToken();
  if (!token) return { message: 'No hay sesión activa' };

  const { data } = await api.post('/auth/logout/access', {}, {
    headers: { 'Content-Type': 'application/json' },
  });

  await StorageService.removeAccessToken();
  await StorageService.removeRefreshToken();
  return data;
}

export async function verifyToken() {
  const { data } = await api.post('/auth/verify-token', {}, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 5000,
  });
  return data;
}
