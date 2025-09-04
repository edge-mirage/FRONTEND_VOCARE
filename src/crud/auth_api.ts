// src/api/auth_api.ts
import api, { BASE_URL } from '@/crud/auth';
import { StorageService } from '@/services/StorageService';
import type { MinimalUser } from '@/services/StorageService';

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
export async function login(body: LoginBody): Promise<AuthUser> {
  // Usa el cliente 'api' (con interceptores)
  const { data } = await api.post<TokenPairResponse>('/auth/login', body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  // Estructura nueva esperada
  if (data?.access_token && data?.refresh_token && data?.user) {
    await saveSession(data);
    return data.user;
  }

  // Fallback opcional si tu backend antiguo devuelve user_id
  // (puedes remover esto si ya no aplica)
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

export async function register(body: RegisterBody) {
  const { data } = await api.post('/auth/register', body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  return data;
}

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
