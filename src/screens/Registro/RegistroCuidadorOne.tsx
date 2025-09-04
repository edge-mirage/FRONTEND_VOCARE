import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RegistroStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';

// ===== Toggle rápido =====
const USE_BACKEND = true;

// ===== MOCK local =====
const sleep = (ms: number) => new Promise<void>(r => setTimeout(() => r(), ms));
async function mockSetCaregiverRole(body: { is_primary: boolean }) {
  await sleep(600);
  if (__DEV__) console.log('[MOCK] caregiver_role =>', body.is_primary);
  // Simula siempre ok
  return { ok: true };
}

// ===== API conmutable =====
import { setCaregiverRole as realSetCaregiverRole } from '@/crud/auth_api';
const useApi = () =>
  useMemo(() => ({
    setCaregiverRole: USE_BACKEND ? realSetCaregiverRole : mockSetCaregiverRole,
  }), []);

// ===== Tipos de navegación =====
type Nav = NativeStackNavigationProp<RegistroStackParamList, 'RegistroCuidadorOne'>;

// ✅ INTERFACE PARA LAS PROPS
interface RegistroCuidadorOneProps {
  route?: {
    params?: {
      grupo_uuid?: string;
    };
  };
}

export default function RegistroCuidadorOne({ route }: RegistroCuidadorOneProps) {
  const api = useApi();
  const navigation = useNavigation<Nav>();

  const [loading, setLoading] = useState<'yes' | 'no' | null>(null);
  
  // ✅ RECIBIR grupo_uuid DEL REGISTRO
  const grupo_uuid = route?.params?.grupo_uuid;

  const submit = async (is_primary: boolean) => {
    try {
      setLoading(is_primary ? 'yes' : 'no');
      const res = await api.setCaregiverRole({ is_primary });
      
      if (is_primary) {
        // ✅ PASAR grupo_uuid A REGISTRO DE DATOS DEL PACIENTE CON TYPE ASSERTION
        navigation.navigate('RegistroDatosPaciente', { 
          grupo_uuid 
        } as any);
      } else {
        navigation.navigate('RegistroSolicitaGUID' as any);
      }
    } catch (e: any) {
      console.log('❌ caregiver-role error:', e?.message || e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <View style={styles.card}>
        <View style={styles.illustration}>
          <Ionicons name="flower-outline" size={88} color={colors.primary} />
        </View>
        <Text style={styles.title}>
          ¿Es usted cuidador/a principal de una persona con Alzheimer?
        </Text>
        <Text style={styles.paragraph}>
          El/la cuidador/a principal es aquel que asume la atención diaria y completa del paciente
          con Alzheimer.{"\n"}
          El cuidador principal será el líder del grupo familiar (funcionalidad que ofrece la
          aplicación). Aquellos usuarios que no sean líderes de grupo tendrán permisos y accesos
          secundarios formando parte del grupo.
        </Text>
        {/* Botón: Sí, soy cuidador/a principal */}
        <Pressable
          onPress={() => submit(true)}
          disabled={loading !== null}
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && { opacity: 0.9 },
            loading === 'yes' && { opacity: 0.6 },
          ]}
        >
          {loading === 'yes'
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryBtnLabel}>Sí, soy cuidador/a principal</Text>}
        </Pressable>
        {/* Botón: No, alguien más cumple este rol */}
        <Pressable
          onPress={() => submit(false)}
          disabled={loading !== null}
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && { opacity: 0.9 },
            loading === 'no' && { opacity: 0.6 },
          ]}
        >
          {loading === 'no'
            ? <ActivityIndicator />
            : <Text style={styles.secondaryBtnLabel}>No, alguien más cumple este rol</Text>}
        </Pressable>

        {/* ✅ DEBUG INFO (SOLO EN DESARROLLO) */}
        {__DEV__ && grupo_uuid && (
          <Text style={{ 
            fontSize: 10, 
            color: '#999', 
            textAlign: 'center', 
            marginTop: 16 
          }}>
            Debug: grupo_uuid = {grupo_uuid.substring(0, 8)}...
          </Text>
        )}
      </View>
    </View>
  );
}

// ===== estilos Vocare =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#32003F' },
  header: { height: 24 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  illustration: {
    alignSelf: 'center',
    width: 128, height: 128,
    borderRadius: 64,
    backgroundColor: '#F7F0FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#2A0040',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 8,
  },
  paragraph: {
    color: '#4B3B58',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#32003F',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnLabel: { color: '#fff', fontWeight: '700', fontSize: 15 },
  secondaryBtn: {
    backgroundColor: '#E2B3F1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnLabel: { color: '#32003F', fontWeight: '700', fontSize: 15 },
});
