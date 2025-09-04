import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '@/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RegistroStackParamList } from '@/navigation/types';
import { useNavigation } from '@react-navigation/native';
import api, { BASE_URL } from '@/crud/auth';
import { StorageService } from '@/services/StorageService';
// ===== Toggle rápido =====
const USE_BACKEND = true; // ✅ CAMBIAR A true PARA USAR BACKEND REAL

// ===== MOCK local =====
const sleep = (ms: number) => new Promise<void>(r => setTimeout(() => r(), ms));

async function mockCreateFamilyGroup() {
  await sleep(400);
  const grupo_uuid = `grupo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  if (__DEV__) console.log('[MOCK] Grupo creado:', grupo_uuid);
  return { data: { uuid: grupo_uuid } };
}

// ✅ FUNCIÓN REAL PARA CREAR GRUPO FAMILIAR
async function createFamilyGroup() {
  try {
    console.log('🏗️ [FAMILY GROUP] Iniciando creación del grupo familiar...');
    console.log('🔗 [FAMILY GROUP] URL:', `${BASE_URL}/family-groups/`);
    
    const response = await api.post('/family-groups/', {
      name: 'Grupo Familiar', // Nombre por defecto
      description: 'Grupo creado durante el registro'
    });
    
    const grupo_uuid = response.data.uuid;
    console.log('✅ [FAMILY GROUP] Grupo familiar creado exitosamente:', grupo_uuid);
    
    // Guardar en storage para uso posterior
    await StorageService.setGroupUuid(grupo_uuid);
    console.log('💾 [FAMILY GROUP] Grupo guardado en storage');
    
    return { data: response.data };
  } catch (error: any) {
    console.error('❌ [FAMILY GROUP] Error creando grupo familiar:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
}

// ===== API conmutable =====
const useApi = () =>
  useMemo(() => ({
    // ✅ OMITIR setCaregiverRole POR AHORA
    createFamilyGroup: USE_BACKEND ? createFamilyGroup : mockCreateFamilyGroup,
  }), []);

// ===== Tipos de navegación =====
type Nav = NativeStackNavigationProp<RegistroStackParamList, 'RegistroCuidadorOne'>;

export default function RegistroCuidadorOne({ route }: any) {
  const api = useApi();
  const navigation = useNavigation<Nav>();

  const [loading, setLoading] = useState<'yes' | 'no' | null>(null);

  // ✅ OBTENER grupo_uuid DE LOS PARÁMETROS (si existe)
  const grupo_uuid = route?.params?.grupo_uuid;

  const submit = async (is_primary: boolean) => {
    try {
      setLoading(is_primary ? 'yes' : 'no');
      
      // ✅ OMITIR LLAMADA A caregiver-role POR AHORA (NO ES NECESARIA)
      console.log(`👤 Usuario seleccionó: ${is_primary ? 'Cuidador Principal' : 'No es Cuidador Principal'}`);
      
      if (is_primary) {
        // ✅ SI ES CUIDADOR PRINCIPAL, CREAR GRUPO FAMILIAR
        console.log('👑 Usuario es cuidador principal, creando grupo familiar...');
        
        const grupoResult = await api.createFamilyGroup();
        const new_grupo_uuid = grupoResult.data.uuid;
        
        console.log('✅ [NAVIGATION] Navegando a RegistroDatosPaciente con grupo_uuid:', new_grupo_uuid);
        navigation.navigate('RegistroDatosPaciente', { grupo_uuid: new_grupo_uuid });
        
      } else {
        // ✅ SI NO ES CUIDADOR PRINCIPAL, SOLICITAR CÓDIGO DE GRUPO
        console.log('👤 Usuario no es cuidador principal, solicitando código de grupo');
        navigation.navigate('RegistroSolicitaGUID', { grupo_uuid });
      }
    } catch (e: any) {
      console.error('❌ [SUBMIT] Error en registro de cuidador:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data
      });
      
      // ✅ MOSTRAR ERROR AL USUARIO
      let errorMessage = 'Hubo un error. Intenta nuevamente.';
      
      if (e.response?.status === 404) {
        errorMessage = 'El servidor no tiene el endpoint requerido.';
      } else if (e.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      } else if (e.code === 'NETWORK_ERROR' || e.message?.includes('Network Error')) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      // Aquí podrías mostrar un Alert si importas Alert
      console.error('🚨 [ERROR PARA USUARIO]:', errorMessage);
      
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
