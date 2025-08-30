// src/screens/Llamadas/LlamadaInstantaneaScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { getAuthToken } from '@/services/auth';

const API_BASE_URL = 'http://192.168.1.5:8000';

export default function LlamadaInstantaneaScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    iniciarLlamadaInstantanea();
  }, []);

  const iniciarLlamadaInstantanea = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/llamadas/instantanea`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        navigation.navigate('LlamadaEnCurso', {
          contexto: ' contexto predeterminado',
          voz: { id: 'default', name: 'Voz Predeterminada' },
          duracion: 15,
        });
      } else {
        Alert.alert('Error', 'No se pudo iniciar la llamada instantánea');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error iniciando llamada instantánea:', error);
      Alert.alert('Error', 'No se pudo iniciar la llamada instantánea');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Llamada Instantánea" showBackButton onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        <Text style={styles.mensaje}>Iniciando llamada instantánea...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  mensaje: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
});