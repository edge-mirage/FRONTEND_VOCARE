// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, clearSession } from '@/crud/auth_api';
import { StorageService } from '@/services/StorageService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  checkAuthState: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando estado de autenticación...');
      
      const storedUser = await getUser();
      console.log('👤 Usuario almacenado:', storedUser);
      
      if (storedUser && storedUser.id) {
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Inicializar StorageService con datos del usuario
        console.log('📦 Inicializando StorageService con datos del usuario...');
        await StorageService.initializeFromUser(storedUser);
        console.log('✅ StorageService inicializado');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ No hay usuario autenticado');
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
      // Limpiar sesión si hay error
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await clearSession();
      await StorageService.clearAppData();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Sesión cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      // Aunque haya error, forzar el logout local
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      checkAuthState,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
