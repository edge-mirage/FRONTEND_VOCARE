// src/screens/Home/CuentaScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { logoutAccess } from '@/crud/auth';
import { useAuth } from '@/context/AuthContext';

export default function CuentaScreen() {
  const { user, checkAuthState } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutAccess();
              // Actualizar el contexto de autenticación
              await checkAuthState();
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Mi Cuenta" />
      <View style={{ padding: spacing.xl }}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userTitle}>Información del Usuario</Text>
            <Text style={styles.userDetail}>Nombre: {user.name}</Text>
            <Text style={styles.userDetail}>Email: {user.email}</Text>
            {user.middle_name && <Text style={styles.userDetail}>Segundo nombre: {user.middle_name}</Text>}
            {user.last_name && <Text style={styles.userDetail}>Apellido: {user.last_name}</Text>}
          </View>
        )}
        
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userInfo: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  userTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  userDetail: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});