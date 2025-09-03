import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = '@auth/access_token';
const REFRESH_KEY = '@auth/refresh_token';
const USER_KEY   = '@auth/user';

export const StorageService = {
  // Obtener el access token
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_KEY);
  },

  // Obtener el refresh token
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_KEY);
  },

  // Guardar access token
  async setAccessToken(token: string) {
    return AsyncStorage.setItem(ACCESS_KEY, token);
  },

  // Guardar refresh token
  async setRefreshToken(token: string) {
    return AsyncStorage.setItem(REFRESH_KEY, token);
  },

  // Remover access token
  async removeAccessToken() {
    return AsyncStorage.removeItem(ACCESS_KEY);
  },

  // Remover refresh token
  async removeRefreshToken() {
    return AsyncStorage.removeItem(REFRESH_KEY);
  },

  // Guardar user
  async setUser(user: any) {
    return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Remover user
  async removeUser() {
    return AsyncStorage.removeItem(USER_KEY);
  },

  // Limpiar sesión
  async clearSession() {
    return AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY]);
  }
};
