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
} from 'react-native';
import { colors, spacing } from '@/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
}: { sintomas: string[]; grupo_uuid?: string }) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
  if (__DEV__) console.log('[MOCK] Enviando síntomas:', sintomas, grupo_uuid);
  return { ok: true };
}


// BACKEND API
import { addSymptomByGroup } from '../../crud/pacient';
// (ajusta la cantidad de ../ según tu estructura de carpetas)

// ✅ FUNCIÓN PARA ENVIAR SÍNTOMAS AL BACKEND
async function enviarSintomasAlBackend({
  sintomas,
  grupo_uuid,
}: {
  sintomas: string[];
  grupo_uuid?: string;
}) {
  if (!grupo_uuid) {
    throw new Error('grupo_uuid es requerido para el backend');
  }
  
  const requests = sintomas.map(nombre => 
    addSymptomByGroup({
      nombre: nombre,
      descripcion: ''
    }, grupo_uuid)
  );
  
  const results = await Promise.all(requests);
  return { ok: true, results };
}


// 🟢 Hook para API con nuevo backend
const useApi = () =>
  useMemo(
    () => ({
      enviarSintomas: USE_BACKEND ? enviarSintomasAlBackend : mockEnviarSintomas,
    }),
    []
  );

export default function RegistroSintomasPaciente({ navigation, route }: any) {
  const api = useApi();
  const grupo_uuid = route?.params?.grupo_uuid || null;

  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
      await api.enviarSintomas({ sintomas: seleccionados, grupo_uuid });
      if (USE_BACKEND) {
        Alert.alert('¡Síntomas registrados!', 'Se guardaron en la base de datos.');
      } else {
        Alert.alert('Síntomas registrados', seleccionados.join('\n'));
      }
      navigation.navigate('RegistroSintomasEscala', { grupo_uuid });
    } catch (e: any) {
      Alert.alert('Error al registrar síntomas', e?.message || 'Intenta de nuevo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary + '10' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Síntomas</Text>
        <Text style={styles.descripcion}>
          Conteste las siguientes preguntas de manera{'\n'}
          que mejor se ajuste al estado actual de la persona que tiene al cuidado.{'\n'}
          <Text style={{ color: colors.text + '99' }}>
            Esta información la podrá editar posteriormente.
          </Text>
        </Text>

        <Text style={styles.subtitulo}>Síntomas Físicos (Si/No)</Text>

        {/* Lista de síntomas */}
        {sintomasAlzheimer.map((nombre) => (
          <Pressable
            key={nombre}
            style={styles.item}
            onPress={() => toggleSintoma(nombre)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: seleccionados.includes(nombre) }}
          >
            <View style={styles.checkbox}>
              {seleccionados.includes(nombre) && (
                <Ionicons name="checkmark" size={20} color="#fff" />
              )}
            </View>
            <Text style={styles.itemText}>{nombre}</Text>
          </Pressable>
        ))}

        {/* Botón continuar */}
        <Pressable style={styles.btn} onPress={handleContinuar} disabled={loading}>
          <Text style={styles.btnLabel}>{loading ? 'Guardando...' : 'Continuar'}</Text>
        </Pressable>
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
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemText: {
    color: colors.text,
    fontSize: 16,
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
