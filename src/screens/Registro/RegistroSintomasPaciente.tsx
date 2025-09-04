// src/screens/Registro/RegistroSintomasPaciente.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing } from '@/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { addSymptomByGroup } from '../../crud/pacient';

// Cambia esto para alternar entre mock y backend
const USE_BACKEND = true; // ✅ CAMBIAR A true PARA USAR BACKEND

// Síntomas físicos
const sintomasAlzheimer = [
  'Pérdida de peso',
  'Problemas de equilibrio y caídas',
  'Convulsiones',
  'Dificultades para tragar',
  'Pérdida de memoria reciente',
  'Dificultad para encontrar palabras',
  'Desorientación en tiempo y lugar',
  'Cambios de humor o personalidad',
  'Repetición de preguntas o frases',
  'Problemas para reconocer familiares/amigos',
  'Dificultad para realizar tareas cotidianas',
  'Aislamiento social',
  'Alucinaciones o delirios',
];

// MOCK API
async function mockEnviarSintomas({
  sintomas,
  grupo_uuid,
}: {
  sintomas: string[];
  grupo_uuid?: string;
}) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
  if (__DEV__) console.log('[MOCK] Enviando síntomas:', sintomas, grupo_uuid);
  return { ok: true };
}

// ✅ FUNCIÓN REAL PARA ENVIAR SÍNTOMAS
async function enviarSintomasBatch({
  sintomas,
  grupo_uuid,
}: {
  sintomas: string[];
  grupo_uuid?: string;
}) {
  const requests = sintomas.map(nombre => 
    addSymptomByGroup({
      nombre: nombre,
      descripcion: ''
    }, grupo_uuid)
  );
  
  return Promise.all(requests);
}

// ✅ HOOK useApi
const useApi = () =>
  useMemo(
    () => ({
      enviarSintomas: USE_BACKEND ? enviarSintomasBatch : mockEnviarSintomas,
    }),
    []
  );

export default function RegistroSintomasPaciente({ navigation, route }: any) {
  const api = useApi();

  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ RECIBIR grupo_uuid EN LUGAR DE paciente_id
  const grupo_uuid = route?.params?.grupo_uuid;

  const toggleSintoma = (nombre: string) => {
    setSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((n) => n !== nombre) : [...prev, nombre]
    );
  };

  const handleContinuar = async () => {
    if (seleccionados.length === 0) {
      Alert.alert('Selecciona al menos un síntoma físico');
      return;
    }

    setLoading(true);
    try {
      // ✅ VERIFICAR QUE grupo_uuid EXISTA
      if (!grupo_uuid) {
        Alert.alert('Error', 'No se pudo identificar el grupo familiar');
        return;
      }

      // ✅ USAR LA API CONFIGURADA
      await api.enviarSintomas({
        sintomas: seleccionados,
        grupo_uuid
      });
      
      console.log('✅ [SÍNTOMAS] Síntomas registrados para grupo:', grupo_uuid);
      navigation.navigate('RegistroSintomasEscala', { grupo_uuid });
    } catch (error: any) {
      console.error('❌ [SÍNTOMAS] Error:', error);
      Alert.alert('Error', error?.message || 'Error al enviar síntomas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary + '10' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Síntomas físicos</Text>
        <Text style={styles.descripcion}>
          Selecciona los síntomas que presenta la persona cuidada:
        </Text>

        <Text style={styles.subtitulo}>Lista de síntomas:</Text>

        {sintomasAlzheimer.map((nombre, index) => {
          const isSelected = seleccionados.includes(nombre);
          return (
            <Pressable
              key={index}
              style={styles.item}
              onPress={() => toggleSintoma(nombre)}
              disabled={loading}
            >
              <View style={[styles.checkbox, isSelected && { backgroundColor: colors.primary }]}>
                {isSelected && <Ionicons name="checkmark" size={18} color="#fff" />}
              </View>
              <Text style={styles.itemText}>{nombre}</Text>
            </Pressable>
          );
        })}

        <Pressable 
          style={[styles.btn, loading && { opacity: 0.6 }]} 
          onPress={handleContinuar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnLabel}>Continuar</Text>
          )}
        </Pressable>

        {/* Debug info */}
        {__DEV__ && grupo_uuid && (
          <Text style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 16 }}>
            Debug: grupo_uuid = {grupo_uuid.substring(0, 8)}...
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  titulo: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 6,
    marginTop: 4,
  },
  descripcion: {
    color: colors.text + 'CC',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  subtitulo: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginVertical: 12,
    marginBottom: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemText: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
  btn: {
    marginTop: 38,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  btnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});
