// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PACIENT_ID: '@app/pacient_id',
  GROUP_UUID: '@app/group_uuid',
  VOICE_ID: '@app/voice_id',
  FAMILY_GROUP_CONTEXT_ID: '@app/family_group_context_id',
};

const ACCESS_KEY = '@auth/access_token';
const REFRESH_KEY = '@auth/refresh_token';
const USER_KEY   = '@auth/user';

export class StorageService {
  // Obtener el access token
  static async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_KEY);
  }

  // Obtener el refresh token
  static async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_KEY);
  }

  // Guardar access token
  static async setAccessToken(token: string) {
    return AsyncStorage.setItem(ACCESS_KEY, token);
  }

  // Guardar refresh token
  static async setRefreshToken(token: string) {
    return AsyncStorage.setItem(REFRESH_KEY, token);
  }

  // Remover access token
  static async removeAccessToken() {
    return AsyncStorage.removeItem(ACCESS_KEY);
  }

  // Remover refresh token
  static async removeRefreshToken() {
    return AsyncStorage.removeItem(REFRESH_KEY);
  }

  // Pacient ID
  static async setPacientId(id: number): Promise<void> {
    try {
      if (id === null || id === undefined) {
        console.warn('⚠️ Intentando guardar pacient_id null/undefined');
        return;
      }
      await AsyncStorage.setItem(KEYS.PACIENT_ID, id.toString());
      console.log('💾 Pacient ID guardado:', id);
    } catch (error) {
      console.error('❌ Error guardando pacient_id:', error);
    }
  }

  static async getPacientId(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.PACIENT_ID);
      if (value === null || value === undefined || value === '') {
        console.log('📭 No hay pacient_id almacenado');
        return null;
      }
      const parsedId = parseInt(value, 10);
      if (isNaN(parsedId)) {
        console.warn('⚠️ pacient_id no es un número válido:', value);
        return null;
      }
      console.log('📖 Pacient ID obtenido:', parsedId);
      return parsedId;
    } catch (error) {
      console.error('❌ Error obteniendo pacient_id:', error);
      return null;
    }
  }

  static async clearPacientId(): Promise<void> {
    try { await AsyncStorage.removeItem(KEYS.PACIENT_ID); }
    catch (e) { console.error('❌ Error limpiando pacient_id:', e); }
  }

  // Group UUID
  static async setGroupUuid(uuid: string): Promise<void> {
    try {
      if (!uuid || uuid.trim() === '') {
        console.warn('⚠️ Intentando guardar group_uuid vacío');
        return;
      }
      await AsyncStorage.setItem(KEYS.GROUP_UUID, uuid);
      console.log('💾 Group UUID guardado:', uuid);
    } catch (error) {
      console.error('❌ Error guardando group_uuid:', error);
    }
  }

  static async getGroupUuid(): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.GROUP_UUID);
      if (!value || value.trim() === '') {
        console.log('📭 No hay group_uuid almacenado');
        return null;
      }
      console.log('📖 Group UUID obtenido:', value);
      return value;
    } catch (error) {
      console.error('❌ Error obteniendo group_uuid:', error);
      return null;
    }
  }

  // Voice ID
  static async setVoiceId(voiceId: string): Promise<void> {
    try {
      if (!voiceId || voiceId.trim() === '') {
        console.warn('⚠️ Intentando guardar voice_id vacío');
        return;
      }
      await AsyncStorage.setItem(KEYS.VOICE_ID, voiceId);
      console.log('💾 Voice ID guardado:', voiceId);
    } catch (error) {
      console.error('❌ Error guardando voice_id:', error);
    }
  }

  static async getVoiceId(): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.VOICE_ID);
      if (!value || value.trim() === '') {
        console.log('📭 No hay voice_id almacenado');
        return null;
      }
      console.log('📖 Voice ID obtenido:', value);
      return value;
    } catch (error) {
      console.error('❌ Error obteniendo voice_id:', error);
      return null;
    }
  }

  // Family Group Context ID
  static async setFamilyGroupContextId(contextId: number): Promise<void> {
    try {
      if (contextId === null || contextId === undefined) {
        console.warn('⚠️ Intentando guardar family_group_context_id null/undefined');
        return;
      }
      await AsyncStorage.setItem(KEYS.FAMILY_GROUP_CONTEXT_ID, contextId.toString());
      console.log('💾 Family Group Context ID guardado:', contextId);
    } catch (error) {
      console.error('❌ Error guardando family_group_context_id:', error);
    }
  }

  static async getFamilyGroupContextId(): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(KEYS.FAMILY_GROUP_CONTEXT_ID);
      if (value === null || value === undefined || value === '') {
        console.log('📭 No hay family_group_context_id almacenado');
        return null;
      }
      const parsedId = parseInt(value, 10);
      if (isNaN(parsedId)) {
        console.warn('⚠️ family_group_context_id no es un número válido:', value);
        return null;
      }
      console.log('📖 Family Group Context ID obtenido:', parsedId);
      return parsedId;
    } catch (error) {
      console.error('❌ Error obteniendo family_group_context_id:', error);
      return null;
    }
  }

  // Inicializar desde datos del usuario
  static async initializeFromUser(user: any, pacient?: { id?: number } | null): Promise<void> {
    try {
      console.log('🔧 Inicializando StorageService desde usuario:', user);
      
      if (!user) {
        console.warn('⚠️ Usuario es null/undefined, no se puede inicializar');
        return;
      }

      // Pacient ID
      // if (user.id && typeof user.id === 'number') {
      //   await this.setPacientId(user.id);
      // } else {
      //   console.warn('⚠️ user.id no es válido:', user.id);
      // }

      // Group UUID
      if (user.group_uuid && typeof user.group_uuid === 'string') {
        await this.setGroupUuid(user.group_uuid);
      } else {
        console.warn('⚠️ user.group_uuid no es válido:', user.group_uuid);
      }

      // Voice ID
      if (user.voice_id && typeof user.voice_id === 'string') {
        await this.setVoiceId(user.voice_id);
      } else {
        console.warn('⚠️ user.voice_id no es válido:', user.voice_id);
      }
      
      // ✅ Pacient ID (si fue provisto)
      if (pacient?.id && Number.isFinite(pacient.id)) {
        await this.setPacientId(pacient.id as number);
      } else { // si cambió de usuario o no hay paciente asociado, limpia para evitar stale
        await this.clearPacientId();
        console.warn('⚠️ No se estableció pacient_id (pacient ausente o inválido)');
      }

      console.log('✅ StorageService inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando StorageService:', error);
    }
  }

  // Limpiar datos de la app
  static async clearAppData(): Promise<void> {
    try {
      console.log('🧹 Limpiando datos de la aplicación...');
      await AsyncStorage.multiRemove(Object.values(KEYS));
      console.log('✅ Datos de la aplicación limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos:', error);
    }
  }

  // Para debugging - obtener todos los datos almacenados
  static async getAllStoredData(): Promise<Record<string, string | null>> {
    try {
      const keys = Object.values(KEYS);
      const values = await AsyncStorage.multiGet(keys);
      const data: Record<string, string | null> = {};
      
      values.forEach(([key, value]) => {
        data[key] = value;
      });
      
      console.log('📊 Todos los datos almacenados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo todos los datos:', error);
      return {};
    }
  }

  // Nuevo método para limpiar sesión al cerrar app
  static async clearSessionOnAppClose(): Promise<void> {
    try {
      console.log('🧹 Iniciando limpieza de sesión...');
      await StorageService.removeAccessToken();
      await StorageService.removeRefreshToken();
      console.log('✅ Sesión limpiada al cerrar app');
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }

  // Método para verificar si hay sesión válida
  static async hasValidSession(): Promise<boolean> {
    const accessToken = await StorageService.getAccessToken();
    return !!accessToken;
  }

  // Limpiar todo (incluyendo tokens)
  static async clearAll(): Promise<void> {
    try {
      console.log('🧹 Limpiando TODOS los datos...');
      await AsyncStorage.multiRemove([
        ...Object.values(KEYS),
        ACCESS_KEY,
        REFRESH_KEY,
        USER_KEY
      ]);
      console.log('✅ Todos los datos limpiados');
    } catch (error) {
      console.error('❌ Error limpiando todos los datos:', error);
    }
  }
}