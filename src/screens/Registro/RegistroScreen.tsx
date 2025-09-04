// src/screens/Registro/RegistroScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { colors, spacing } from '@/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as backendAuth from '@/crud/auth_api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RegistroStackParamList } from '@/navigation/types';

type RegistroScreenNavigationProp = NativeStackNavigationProp<RegistroStackParamList, 'RegistroScreen'>;
interface RegistroScreenProps {
  navigation: RegistroScreenNavigationProp;
}

const USE_BACKEND = true;


type MockUser = {
  email: string;
  name: string;
  relationship: string;
  group_uuid: string | null;
  email_verified: boolean;
  verification_code?: string;
  created_at: string;
};
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const random6 = () => String(Math.floor(100000 + Math.random() * 900000));
const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

const mockDB: Map<string, MockUser> = new Map();

async function mockRegister(params: {
  name: string;
  email: string;
  password: string;
  relationship: string;
  group_uuid?: string | null;
}) {
  await sleep(500);
  const name = params.name.trim();
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const relationship = params.relationship.trim();
  const group_uuid = params.group_uuid ?? null;

  if (!name) throw new Error('El nombre es requerido');
  if (!email) throw new Error('El email es requerido');
  if (!EMAIL_REGEX.test(email)) throw new Error('Email inválido');
  if (!password || password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
  if (!relationship) throw new Error('Debe seleccionar un parentesco');

  if (mockDB.has(email)) throw new Error('El email ya está registrado');
  const code = random6();
  const user: MockUser = {
    email, name, relationship, group_uuid,
    email_verified: false, verification_code: code, created_at: new Date().toISOString(),
  };
  mockDB.set(email, user);
  if (__DEV__) console.log(`[MOCK][register] Código para ${email}: ${code}`);
  return { message: 'Código de verificación enviado' };
}
async function mockVerifyEmail(params: { email: string; code: string }) {
  await sleep(400);
  const email = params.email.trim().toLowerCase();
  const code = params.code.trim();
  const user = mockDB.get(email);
  if (!user) throw new Error('Usuario no encontrado');
  if (!code || code.length !== 6 || code !== user.verification_code)
    throw new Error('Código de verificación inválido o expirado');
  user.email_verified = true; user.verification_code = undefined; mockDB.set(email, user);
  return { message: 'Email verificado' };
}
async function mockResendVerification(params: { email: string }) {
  await sleep(400);
  const email = params.email.trim().toLowerCase();
  const user = mockDB.get(email);
  if (!user) throw new Error('Usuario no encontrado');
  const newCode = random6();
  user.verification_code = newCode; mockDB.set(email, user);
  if (__DEV__) console.log(`[MOCK][resend] Nuevo código para ${email}: ${newCode}`);
  return { message: 'Nuevo código enviado' };
}

const useApi = () =>
  useMemo(() => {
    if (USE_BACKEND) {
      return {
        register: backendAuth.register,
        verifyEmail: backendAuth.verifyEmail,
        resendVerification: backendAuth.resendVerification,
      };
    }
    return {
      register: mockRegister,
      verifyEmail: mockVerifyEmail,
      resendVerification: mockResendVerification,
    };
  }, []);

const parentescos = ['Padre/Madre', 'Hijo/a', 'Nieto/a', 'Cónyuge', 'Hermano/a', 'Otro'];

export default function RegistroScreen({ navigation }: RegistroScreenProps) {
  const api = useApi();

  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [numero, setNumero] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grupoFamiliar, setGrupoFamiliar] = useState('');

  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const lastCodeRef = useRef<string | null>(null);

  const validateForm = (): string | null => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (!apellidos.trim()) return 'Los apellidos son requeridos';
    if (!email.trim()) return 'El email es requerido';
    if (!EMAIL_REGEX.test(email)) return 'Email inválido';
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    if (!parentesco) return 'Debe seleccionar un parentesco';
    return null;
  };

  const onContinuar = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de Validación', validationError);
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: `${nombre.trim()} ${apellidos.trim()}`,
        email: email.trim().toLowerCase(),
        password: password,
        relationship: parentesco,
        group_uuid: grupoFamiliar.trim() || null,
      });

      if (!USE_BACKEND) {
        const u = mockDB.get(email.trim().toLowerCase());
        lastCodeRef.current = u?.verification_code ?? null;
        if (__DEV__ && lastCodeRef.current) {
          console.log(`[MOCK][UI] Último código mostrado en banner: ${lastCodeRef.current}`);
        }
      }
      setShowBanner(true);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      let errorMessage = 'Hubo un error al registrar. Intenta nuevamente.';
      if (error?.message?.includes('ya está registrado')) {
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Ingresa un código de 6 dígitos válido');
      return;
    }
    setVerificationLoading(true);
    try {
      await api.verifyEmail({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim(),
      });
      setShowBanner(false);

      // 🚩 Navega correctamente a la siguiente pantalla del registro
      navigation.navigate('RegistroCuidadorOne');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Código de verificación inválido o expirado.');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.resendVerification({
        email: email.trim().toLowerCase(),
      });
      if (!USE_BACKEND) {
        const u = mockDB.get(email.trim().toLowerCase());
        lastCodeRef.current = u?.verification_code ?? null;
        if (__DEV__ && lastCodeRef.current) {
          console.log(`[MOCK][UI] Nuevo código reenviado: ${lastCodeRef.current}`);
        }
      }
      Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu email.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudo reenviar el código. Intenta más tarde.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {!USE_BACKEND && (
          <Text style={{ color: '#8c5', textAlign: 'center', marginBottom: 8 }}>
            MODO MOCK (solo UI) • {__DEV__ && lastCodeRef.current ? `Código dev: ${lastCodeRef.current}` : 'Sin código visible'}
          </Text>
        )}
        <Text style={styles.titulo}>Datos personales</Text>
        <Text style={styles.label}>Nombre*</Text>
        <TextInput style={styles.input} placeholder="Ingrese su nombre" value={nombre} onChangeText={setNombre} placeholderTextColor="#AAA" editable={!loading} />
        <Text style={styles.label}>Apellidos</Text>
        <TextInput style={styles.input} placeholder="Ingrese su apellido/s" value={apellidos} onChangeText={setApellidos} placeholderTextColor="#AAA" editable={!loading} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="ejemplo@correo.com" value={email} onChangeText={setEmail} placeholderTextColor="#AAA" keyboardType="email-address" autoCapitalize="none" editable={!loading} />
        <Text style={styles.label}>Número telefónico</Text>
        <TextInput style={styles.input} placeholder="Ingrese su número telefónico" value={numero} onChangeText={setNumero} placeholderTextColor="#AAA" editable={!loading} />        
        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" value={password} onChangeText={setPassword} placeholderTextColor="#AAA" secureTextEntry editable={!loading} />
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput style={styles.input} placeholder="Repita su contraseña" value={confirmPassword} onChangeText={setConfirmPassword} placeholderTextColor="#AAA" secureTextEntry editable={!loading} />
        <Text style={styles.label}>Fecha de nacimiento (opcional)</Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={fechaNacimiento} onChangeText={setFechaNacimiento} placeholderTextColor="#AAA" editable={!loading} />
        <Text style={styles.label}>¿Cuál es su parentesco con la persona que padece Alzheimer?</Text>
        <Pressable style={styles.input} onPress={() => !loading && setModalVisible(true)}>
          <Text style={{ color: parentesco ? colors.text : '#AAA' }}>{parentesco ? parentesco : 'Seleccione...'}</Text>
        </Pressable>
        
        <Text style={styles.label}>Código de grupo familiar (opcional)</Text>
        <TextInput style={styles.input} placeholder="Si tienes un código de grupo, ingrésalo aquí" value={grupoFamiliar} onChangeText={setGrupoFamiliar} placeholderTextColor="#AAA" editable={!loading} />
        {/* Botón continuar */}
        <Pressable style={styles.btn} onPress={onContinuar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnLabel}>Continuar</Text>}
        </Pressable>
      </ScrollView>

      {/* Modal de selección de parentesco */}
      <Modal transparent visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              minWidth: '80%',
              maxWidth: 340,
              elevation: 4,
              alignItems: 'stretch',
            }}
          >
            <Text style={{ fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>Selecciona el parentesco:</Text>
            {parentescos.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setParentesco(item);
                  setModalVisible(false);
                }}
                style={{ paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#EEE' }}
              >
                <Text style={{ color: '#222', fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            ))}
            <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 16 }}>
              <Text style={{ color: colors.primary, textAlign: 'center' }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Banner verificación */}
      <Modal visible={showBanner} transparent animationType="fade" onRequestClose={() => !verificationLoading && setShowBanner(false)}>
        <View style={styles.overlay}>
          <View style={styles.banner}>
            <Ionicons name="reload-circle-outline" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.bannerTitle}>
              Se envió un código de verificación a:{'\n'}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>
            </Text>
            <Text style={styles.bannerSubtitle}>Inserte el código de 6 dígitos:</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={{
                  fontSize: 32, letterSpacing: 6, color: colors.primary, fontWeight: '800', textAlign: 'center',
                  borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 4, minWidth: 200,
                }}
                placeholder="______"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
                editable={!verificationLoading}
                placeholderTextColor={colors.primary + '50'}
              />
            </View>
            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%' }}>
              <Pressable
                onPress={handleVerifyCode}
                disabled={verificationLoading}
                style={{
                  backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, opacity: verificationLoading ? 0.6 : 1,
                }}
              >
                {verificationLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Verificar</Text>}
              </Pressable>
              <Pressable onPress={handleResendCode} disabled={verificationLoading} style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                <Text style={{ color: colors.primary, textDecorationLine: 'underline' }}>Reenviar</Text>
              </Pressable>
            </View>
            {!USE_BACKEND && __DEV__ && (
              <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                Código actual: {lastCodeRef.current ?? '—'} (se muestra solo en desarrollo)
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  logoWrap: {
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 16,
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#F7F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { color: colors.primary, fontSize: 20, fontWeight: '700', marginBottom: spacing.lg, alignSelf: 'center' },
  label: { fontSize: 13, color: colors.text, marginBottom: 4, marginTop: 8, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8, backgroundColor: '#F8F7FC' },
  btn: { marginTop: 20, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  btnLabel: { color: '#fff', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: 'rgba(44,0,44,0.14)', alignItems: 'center', justifyContent: 'center' },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 26,
    minWidth: 320,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  bannerTitle: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  logo: {
    width: 96,
    height: 96,
  },
  bannerSubtitle: { color: colors.text, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  codeContainer: { marginTop: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'center' },
});
