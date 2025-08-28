// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys para AsyncStorage
export const STORAGE_KEYS = {
  // Autenticación (ya existentes en auth.ts)
  ACCESS_TOKEN: '@auth/access_token',
  REFRESH_TOKEN: '@auth/refresh_token',
  USER: '@auth/user',
  
  // Parámetros de la aplicación
  PACIENT_ID: '@app/pacient_id',
  GROUP_UUID: '@app/group_uuid',
  VOICE_ID: '@app/voice_id',
  FAMILY_GROUP_CONTEXT_ID: '@app/family_group_context_id',
};

export class StorageService {
  // Métodos para parámetros de la aplicación
  static async setPacientId(pacientId: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PACIENT_ID, pacientId.toString());
  }

  static async getPacientId(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.PACIENT_ID);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting pacient_id from storage:', error);
      return null;
    }
  }

  static async setGroupUuid(groupUuid: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GROUP_UUID, groupUuid);
  }

  static async getGroupUuid(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.GROUP_UUID);
    } catch (error) {
      console.error('Error getting group_uuid from storage:', error);
      return null;
    }
  }

  static async setVoiceId(voiceId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.VOICE_ID, voiceId);
  }

  static async getVoiceId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.VOICE_ID);
    } catch (error) {
      console.error('Error getting voice_id from storage:', error);
      return null;
    }
  }

  static async setFamilyGroupContextId(contextId: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_GROUP_CONTEXT_ID, contextId.toString());
  }

  static async getFamilyGroupContextId(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_GROUP_CONTEXT_ID);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      console.error('Error getting family_group_context_id from storage:', error);
      return null;
    }
  }

  // Método para inicializar datos desde el usuario autenticado
  static async initializeFromUser(user: any): Promise<void> {
    try {
      if (user.id) {
        await this.setPacientId(user.id);
      }
      if (user.group_uuid) {
        await this.setGroupUuid(user.group_uuid);
      }
      if (user.voice_id) {
        await this.setVoiceId(user.voice_id);
      }
    } catch (error) {
      console.error('Error initializing storage from user:', error);
    }
  }

  // Método para limpiar todos los datos de la app (mantener solo auth)
  static async clearAppData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PACIENT_ID,
        STORAGE_KEYS.GROUP_UUID,
        STORAGE_KEYS.VOICE_ID,
        STORAGE_KEYS.FAMILY_GROUP_CONTEXT_ID,
      ]);
    } catch (error) {
      console.error('Error clearing app data:', error);
    }
  }

  // Método para obtener todos los datos almacenados (debugging)
  static async getAllStoredData(): Promise<Record<string, string | null>> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const values = await AsyncStorage.multiGet(keys);
      
      const result: Record<string, string | null> = {};
      values.forEach(([key, value]) => {
        result[key] = value;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting all stored data:', error);
      return {};
    }
  }
}
