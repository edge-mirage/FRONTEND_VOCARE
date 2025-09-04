import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StorageService } from '@/services/StorageService';

export const useAppStateAuth = () => {
  console.log('🚀 useAppStateAuth: Hook ejecutándose');

  useEffect(() => {
    console.log('🔧 useAppStateAuth: useEffect iniciado');
    console.log('📱 Estado actual de la app:', AppState.currentState);
    
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('🔄 App state cambió de', AppState.currentState, 'a', nextAppState);
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('📱 App fue a background/inactive - limpiando tokens');
        try {
          await StorageService.clearSessionOnAppClose();
          console.log('✅ Tokens limpiados exitosamente');
        } catch (error) {
          console.error('❌ Error limpiando tokens:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    console.log('👂 AppState listener agregado');
    
    return () => {
      console.log('🧹 Limpiando listener de AppState');
      subscription?.remove();
    };
  }, []);
};