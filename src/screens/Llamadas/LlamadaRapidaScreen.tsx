// src/screens/Llamadas/LlamadaRapidaScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import ListItem from '@/components/ListItem';
import { colors, spacing } from '@/theme';
import { getAuthToken } from '@/services/auth';

const API_BASE_URL = 'http://192.168.1.5:8000';

type Contexto = {
  id: number;
  name: string;
  description: string;
  prompt: string;
};

type Voz = {
  id: string;
  name: string;
};

export default function LlamadaRapidaScreen() {
  const navigation = useNavigation();
  const [contextos, setContextos] = useState<Contexto[]>([]);
  const [voces, setVoces] = useState<Voz[]>([]);
  const [contextoSeleccionado, setContextoSeleccionado] = useState<Contexto | null>(null);
  const [vozSeleccionada, setVozSeleccionada] = useState<Voz | null>(null);
  const [duracion, setDuracion] = useState(10);
  const [contextoPersonalizado, setContextoPersonalizado] = useState('');

  useEffect(() => {
    cargarContextos();
    cargarVoces();
  }, []);

  const cargarContextos = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/contexts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContextos(data);
      }
    } catch (error) {
      console.error('Error cargando contextos:', error);
    }
  };

  const cargarVoces = async () => {
    setVoces([
      { id: 'voz1', name: 'Voz Suave' },
      { id: 'voz2', name: 'Voz Alegre' },
      { id: 'voz3', name: 'Voz Seria' },
    ]);
  };

  const iniciarLlamadaRapida = async () => {
    try {
      const token = await getAuthToken();
      const contexto = contextoSeleccionado ? contextoSeleccionado.prompt : contextoPersonalizado;
      
      const response = await fetch(`${API_BASE_URL}/llamadas/rapida`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contexto,
          voz_id: vozSeleccionada?.id,
          duracion_min: duracion,
        }),
      });

      if (response.ok) {
        navigation.navigate('LlamadaEnCurso', {
          contexto,
          voz: vozSeleccionada,
          duracion,
        });
      } else {
        Alert.alert('Error', 'No se pudo iniciar la llamada');
      }
    } catch (error) {
      console.error('Error iniciando llamada:', error);
      Alert.alert('Error', 'No se pudo iniciar la llamada');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Llamada Rápida" showBackButton />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.seccionTitulo}>Contexto</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un contexto personalizado..."
          value={contextoPersonalizado}
          onChangeText={setContextoPersonalizado}
          multiline
          numberOfLines={4}
        />
        
        <Text style={styles.seccionTitulo}>O selecciona un contexto predefinido</Text>
        {contextos.map((contexto) => (
          <ListItem
            key={contexto.id}
            title={contexto.name}
            subtitle={contexto.description}
            onPress={() => setContextoSeleccionado(contexto)}
            right={
              contextoSeleccionado?.id === contexto.id ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              ) : null
            }
          />
        ))}

        <Text style={styles.seccionTitulo}>Voz replicada</Text>
        {voces.map((voz) => (
          <ListItem
            key={voz.id}
            title={voz.name}
            onPress={() => setVozSeleccionada(voz)}
            right={
              vozSeleccionada?.id === voz.id ? (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              ) : null
            }
          />
        ))}

        <Text style={styles.seccionTitulo}>Duración aproximada</Text>
        <View style={styles.duracionContainer}>
          {[5, 10, 15, 20].map((min) => (
            <Pressable
              key={min}
              style={[
                styles.duracionBoton,
                duracion === min && styles.duracionBotonSeleccionado,
              ]}
              onPress={() => setDuracion(min)}
            >
              <Text
                style={[
                  styles.duracionTexto,
                  duracion === min && styles.duracionTextoSeleccionado,
                ]}
              >
                {min} min
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.botonIniciar} onPress={iniciarLlamadaRapida}>
          <Text style={styles.botonIniciarTexto}>Iniciar Llamada</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    padding: spacing.lg,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  duracionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  duracionBoton: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  duracionBotonSeleccionado: {
    backgroundColor: colors.primary,
  },
  duracionTexto: {
    color: colors.primary,
    fontWeight: '600',
  },
  duracionTextoSeleccionado: {
    color: 'white',
  },
  botonIniciar: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  botonIniciarTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});