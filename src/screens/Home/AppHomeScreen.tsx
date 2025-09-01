// src/screens/Home/AppHomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { Image, StyleSheet, View, Alert, ActivityIndicator, Text } from 'react-native';
import { spacing, colors } from '@/theme';
import { logos } from '@/assets/images';
import { ListItem, ListSection } from '@/components/list';
import { HomeStackParamList } from '@/navigation/types';
import { useAuth } from '@/context/AuthContext';
import { usePacient } from '@/hooks/usePacient';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function AppHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const { pacient, loading, error, refreshPacient } = usePacient();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: logout, style: 'destructive' }
      ]
    );
  };

  const handleVisitWebsite = () => {
    Alert.alert(
      'Visitar sitio web',
      'Esta funcionalidad se implementará próximamente',
      [{ text: 'OK' }]
    );
  };

  const handleSymptoms = () => {
    if (pacient) {
      Alert.alert(
        'Síntomas',
        `Paciente: ${pacient.name}\nSíntomas registrados: ${pacient.symptoms?.length || 0}\n\nEsta funcionalidad se implementará próximamente.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin datos',
        'No se pudieron cargar los datos del paciente',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEvents = () => {
    if (pacient) {
      Alert.alert(
        'Eventos',
        `Paciente: ${pacient.name}\nEventos registrados: ${pacient.events?.length || 0}\n\nEsta funcionalidad se implementará próximamente.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin datos',
        'No se pudieron cargar los datos del paciente',
        [{ text: 'OK' }]
      );
    }
  };

  const handleInterests = () => {
    if (pacient) {
      Alert.alert(
        'Intereses',
        `Paciente: ${pacient.name}\nIntereses registrados: ${pacient.interests?.length || 0}\n\nEsta funcionalidad se implementará próximamente.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin datos',
        'No se pudieron cargar los datos del paciente',
        [{ text: 'OK' }]
      );
    }
  };

  // Mostrar información del paciente en el subtítulo de Mi cuenta
  const getAccountSubtitle = () => {
    if (loading) return 'Cargando información...';
    if (error) return 'Error cargando datos';
    if (pacient) {
      return `${pacient.name} - ${user?.email}`;
    }
    return `${user?.email || 'Usuario'}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.logoWrap}>
        <Image source={logos.light} style={{ width: 120, height: 120 }} resizeMode="contain" />
      </View>

      {/* Información del paciente */}
      {loading && (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando datos del paciente...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <ListSection title="Home">
        <ListItem
          icon="person-outline"
          title="Mi cuenta"
          subtitle={getAccountSubtitle()}
          onPress={() => {
            navigation.navigate('Cuenta');
          }}
        />
        <ListItem
          icon="settings-outline"
          title="Configuración"
          subtitle="Ajustes de la aplicación"
          onPress={() => {
            navigation.navigate('Configuracion');
          }}
        />
        
        {/* Solo mostrar opciones del paciente si tenemos datos */}
        {pacient && (
          <>
            <ListItem
              icon="medical-outline"
              title="Síntomas"
              subtitle={`${pacient.symptoms?.length || 0} síntomas registrados`}
              onPress={handleSymptoms}
            />
            <ListItem
              icon="calendar-outline"
              title="Eventos"
              subtitle={`${pacient.events?.length || 0} eventos registrados`}
              onPress={handleEvents}
            />
            <ListItem
              icon="heart-outline"
              title="Intereses"
              subtitle={`${pacient.interests?.length || 0} intereses registrados`}
              onPress={handleInterests}
            />
          </>
        )}

        <ListItem
          icon="globe-outline"
          title="Visita la página oficial"
          subtitle="Más información del proyecto en la web"
          onPress={handleVisitWebsite}
        />
        <ListItem
          icon="log-out-outline"
          title="Cerrar sesión"
          subtitle="Salir de la cuenta"
          variant="danger"
          onPress={handleLogout}
          showDivider={false}
        />
      </ListSection>

      {/* Debug info - remover en producción */}
      {__DEV__ && pacient && (
        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Pacient ID: {pacient.id}</Text>
          <Text style={styles.debugText}>Group UUID: {pacient.group_uuid?.substring(0, 8)}...</Text>
          <Text style={styles.debugText}>Voice ID: {pacient.voice_id || 'N/A'}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  logoWrap: { 
    alignItems: 'center', 
    paddingTop: spacing.xl, 
    paddingBottom: spacing.md 
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#f0f0f0',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 14,
  },
  errorSection: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#ffebee',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  debugSection: {
    margin: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#e8f5e8',
    borderRadius: 6,
  },
  debugTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#2e7d32',
    marginBottom: spacing.xs,
  },
  debugText: {
    fontSize: 11,
    color: '#388e3c',
    marginBottom: 2,
  },
});