// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MinimalUser = {
  id?: number;
  group_uuid?: string | null;
  voice_id?: string | null;
  family_group_context_id?: number;
  email?: string;
  name?: string;
  middle_name?: string;
  last_name?: string;
  dob?: string;
  created_at?: string;
};

type Nullable<T> = T | null;

export const KEYS = {
  // Auth
  ACCESS_TOKEN: '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
  USER: '@auth/user',

  // Dominio
  PACIENT_ID: '@app/pacient_id',
  GROUP_UUID: '@app/group_uuid',
  VOICE_ID: '@app/voice_id',
  FAMILY_GROUP_CONTEXT_ID: '@app/family_group_context_id',
} as const;

export class StorageService {
  // ===== AUTH =====
  static async getAccessToken(): Promise<Nullable<string>> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  }
  static async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
  }
  static async removeAccessToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
  }

  static async getRefreshToken(): Promise<Nullable<string>> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
  }
  static async setRefreshToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
  }
  static async removeRefreshToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.REFRESH_TOKEN);
  }

  static async setUser(user: unknown): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  }
  static async getUser<T = unknown>(): Promise<Nullable<T>> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn('⚠️ USER corrupto en storage. Limpiando.', e);
      await AsyncStorage.removeItem(KEYS.USER);
      return null;
    }
  }
  static async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  }

  static async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]);
  }

  // ===== DOMINIO =====
  static async setPacientId(id: number): Promise<void> {
    if (id === null || id === undefined) {
      console.warn('⚠️ pacient_id null/undefined');
      return;
    }
    await AsyncStorage.setItem(KEYS.PACIENT_ID, String(id));
  }
  static async getPacientId(): Promise<Nullable<number>> {
    const value = await AsyncStorage.getItem(KEYS.PACIENT_ID);
    if (!value) return null;
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? null : n;
  }

  static async setGroupUuid(uuid: string): Promise<void> {
    if (!uuid?.trim()) {
      console.warn('⚠️ group_uuid vacío');
      return;
    }
    await AsyncStorage.setItem(KEYS.GROUP_UUID, uuid);
  }
  static async getGroupUuid(): Promise<Nullable<string>> {
    const value = await AsyncStorage.getItem(KEYS.GROUP_UUID);
    return value?.trim() ? value : null;
  }

  static async setVoiceId(voiceId: string): Promise<void> {
    if (!voiceId?.trim()) {
      console.warn('⚠️ voice_id vacío');
      return;
    }
    await AsyncStorage.setItem(KEYS.VOICE_ID, voiceId);
  }
  static async getVoiceId(): Promise<Nullable<string>> {
    const value = await AsyncStorage.getItem(KEYS.VOICE_ID);
    return value?.trim() ? value : null;
  }

  static async setFamilyGroupContextId(contextId: number): Promise<void> {
    if (contextId === null || contextId === undefined) {
      console.warn('⚠️ family_group_context_id null/undefined');
      return;
    }
    await AsyncStorage.setItem(KEYS.FAMILY_GROUP_CONTEXT_ID, String(contextId));
  }
  static async getFamilyGroupContextId(): Promise<Nullable<number>> {
    const value = await AsyncStorage.getItem(KEYS.FAMILY_GROUP_CONTEXT_ID);
    if (!value) return null;
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? null : n;
  }

  // ===== HELPERS =====
  static async initializeFromUser(user: MinimalUser | null | undefined): Promise<void> {
    try {
      if (!user) {
        console.warn('⚠️ Usuario null/undefined, no se inicializa storage');
        return;
      }
      if (typeof user.id === 'number') await this.setPacientId(user.id);
      if (typeof user.group_uuid === 'string') await this.setGroupUuid(user.group_uuid);
      if (typeof user.voice_id === 'string') await this.setVoiceId(user.voice_id);
      if (typeof user.family_group_context_id === 'number') {
        await this.setFamilyGroupContextId(user.family_group_context_id);
      }
    } catch (e) {
      console.error('❌ Error en initializeFromUser:', e);
    }
  }

  static async clearAppData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  }

  static async getAllStoredData(): Promise<Record<string, string | null>> {
    const keys = Object.values(KEYS);
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.reduce<Record<string, string | null>>((acc, [k, v]) => {
      acc[k] = v ?? null;
      return acc;
    }, {});
  }
}

export default StorageService;
