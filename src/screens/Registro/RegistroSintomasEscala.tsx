// src/screens/RegistroSintomasConductuales.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '@/theme';
import { addSymptomByGroup } from '../../crud/pacient';

// Cambia esto para alternar entre mock y backend
const USE_BACKEND = true;

const sintomasConductuales = [
  {
    key: 'cambios_personalidad',
    label: 'Cambios de personalidad (irritabilidad, suspicacia)',
  },
  { key: 'ansiedad', label: 'Ansiedad o agitación' },
  { key: 'depresion', label: 'Depresión o estado de ánimo bajo' },
  { key: 'alucinaciones', label: 'Alucinaciones (ver o oír cosas que no existen)' },
  { key: 'delirios', label: 'Delirios (ideas falsas, como creer que le roban)' },
  { key: 'suenio', label: 'Alteraciones del sueño (insomnio, inversión del ciclo sueño-vigilia)' },
  { key: 'deambulacion', label: 'Deambulación (caminar sin rumbo)' },
  { key: 'conducta_inapropiada', label: 'Comportamiento social inapropiado' },
  { key: 'catastroficas', label: 'Reacciones catastróficas (llanto, gritos inexplicables)' },
];

// Opciones de frecuencia
const frecuencias = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
];

// MOCK API
async function mockEnviarSintomasConductuales({
  sintomas,
  grupo_uuid,
}: {
  sintomas: { [key: string]: number | null };
  grupo_uuid?: string;
}) {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
  if (__DEV__) console.log('[MOCK] Enviando síntomas conductuales:', sintomas, grupo_uuid);
  return { ok: true };
}

// ✅ FUNCIÓN PARA ENVIAR SÍNTOMAS CONDUCTUALES AL BACKEND
async function enviarSintomasConductualesAlBackend({
  sintomas,
  grupo_uuid,
}: {
  sintomas: { [key: string]: number | null };
  grupo_uuid?: string;
}) {
  if (!grupo_uuid) {
    throw new Error('grupo_uuid es requerido para el backend');
  }
  
  // Filtrar solo los síntomas seleccionados (con valor != null)
  const sintomasSeleccionados = Object.entries(sintomas)
    .filter(([key, freq]) => freq !== null && freq !== undefined)
    .map(([key, freq]) => ({
      key,
      freq,
      label: sintomasConductuales.find(s => s.key === key)?.label || key
    }));
  
  const requests = sintomasSeleccionados.map(({ key, freq, label }) => 
    addSymptomByGroup({
      nombre: `${label} (Frecuencia: ${freq})`,
      descripcion: `Síntoma conductual con frecuencia ${freq}`
    }, grupo_uuid)
  );
  
  const results = await Promise.all(requests);
  return { ok: true, results };
}

// Hook para API 
const useApi = () =>
  useMemo(
    () => ({
      enviarSintomasConductuales: USE_BACKEND ? enviarSintomasConductualesAlBackend : mockEnviarSintomasConductuales,
    }),
    []
  );

export default function RegistroSintomasConductuales({ navigation, route }: any) {
  const api = useApi();
  const grupo_uuid = route?.params?.grupo_uuid || null;
  
  // { [key]: frecuencia }
  const [seleccionados, setSeleccionados] = useState<{ [key: string]: number | null }>({});
  const [loading, setLoading] = useState(false);

  const handleSelect = (key: string, freq: number) => {
    setSeleccionados((prev) => ({
      ...prev,
      [key]: prev[key] === freq ? null : freq, // desmarcar si lo vuelve a tocar
    }));
  };

  const handleContinuar = async () => {
    const algunoMarcado = Object.values(seleccionados).some(v => v !== null && v !== undefined);
    if (!algunoMarcado) {
      Alert.alert('Selecciona al menos un síntoma con su frecuencia');
      return;
    }

    setLoading(true);
    try {
      await api.enviarSintomasConductuales({ sintomas: seleccionados, grupo_uuid });
      if (USE_BACKEND) {
        Alert.alert('¡Síntomas conductuales registrados!', 'Se guardaron en la base de datos.');
      } else {
        Alert.alert('Síntomas registrados', JSON.stringify(seleccionados, null, 2));
      }
      navigation.navigate('RegistroListo', { grupo_uuid });
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
            Esto información la podrá editar posteriormente.
          </Text>
        </Text>

        <Text style={styles.subtitulo}>
          Registro de Síntomas Conductuales y Psicológicos{'\n'}
          <Text style={{ fontWeight: 'normal', fontSize: 14 }}>
            (Frecuencia 1: Leve  2: Moderado  3: Grave)
          </Text>
        </Text>

        {sintomasConductuales.map((s, idx) => (
          <View key={s.key} style={styles.sintomaRow}>
            <View style={styles.frecuenciaRow}>
              {frecuencias.map((f) => (
                <Pressable
                  key={f.value}
                  style={[
                    styles.radio,
                    seleccionados[s.key] === f.value && styles.radioSelected,
                  ]}
                  onPress={() => handleSelect(s.key, f.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: seleccionados[s.key] === f.value }}
                >
                  <Text
                    style={[
                      styles.radioText,
                      seleccionados[s.key] === f.value && styles.radioTextSelected,
                    ]}
                  >
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.sintomaLabel}>{s.label}</Text>
          </View>
        ))}

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
    marginBottom: 12,
  },
  sintomaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 0.4,
    borderColor: '#eee',
    paddingBottom: 6,
  },
  frecuenciaRow: {
    flexDirection: 'row',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },
  radioSelected: {
    backgroundColor: colors.primary,
  },
  radioText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  radioTextSelected: {
    color: '#fff',
  },
  sintomaLabel: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    paddingLeft: 2,
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
