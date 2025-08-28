// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, AuthUser } from '@/crud/auth';
import { StorageService } from '@/services/StorageService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthState = async () => {
    console.log('🔍 AUTH CONTEXT: Verificando estado de autenticación...');
    setIsLoading(true);
    try {
      const userData = await getUser();
      console.log('👤 AUTH CONTEXT: Usuario obtenido:', userData ? { id: userData.id, email: userData.email } : null);
      setUser(userData);
      
      // Si hay usuario, inicializar datos en storage
      if (userData) {
        console.log('💾 AUTH CONTEXT: Inicializando storage con datos del usuario...');
        await StorageService.initializeFromUser(userData);
        console.log('✅ AUTH CONTEXT: Storage inicializado');
      } else {
        // Si no hay usuario, limpiar datos de app
        console.log('🧹 AUTH CONTEXT: Limpiando datos de app...');
        await StorageService.clearAppData();
      }
    } catch (error) {
      console.error('❌ AUTH CONTEXT: Error al verificar estado:', error);
      setUser(null);
      await StorageService.clearAppData();
    } finally {
      setIsLoading(false);
      console.log('🏁 AUTH CONTEXT: Verificación completada');
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    checkAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
