// src/screens/RegistroScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
// ✅ AGREGAR IMPORTS PARA BACKEND
import { register, verifyEmail, resendVerification } from '@/crud/auth';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RegistroStackParamList } from '@/navigation/types'; // ✅ CAMBIAR EL IMPORT

const parentescos = [
  'Padre/Madre',
  'Hijo/a',
  'Nieto/a',
  'Cónyuge',
  'Hermano/a',
  'Otro',
];

// ✅ CORREGIR EL TIPO DE NAVEGACIÓN
type RegistroScreenNavigationProp = NativeStackNavigationProp<RegistroStackParamList, 'RegistroScreen'>;

interface RegistroScreenProps {
  navigation: RegistroScreenNavigationProp;
}

export default function RegistroScreen({ navigation }: RegistroScreenProps) {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  // ✅ AGREGAR CAMPOS PARA BACKEND
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grupoFamiliar, setGrupoFamiliar] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ✅ VALIDACIONES - CAMBIAR A 8 CARACTERES
  const validateForm = (): string | null => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (!apellidos.trim()) return 'Los apellidos son requeridos';
    if (!email.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'; // ✅ CAMBIAR A 8
    if (password !== confirmPassword) return 'Las contraseñas no coinciden';
    if (!parentesco) return 'Debe seleccionar un parentesco';
  if (!termsAccepted) return 'Debes aceptar los términos y condiciones';
    return null;
  };

  // ✅ REGISTRO CON BACKEND (MANTENER LA MISMA LÓGICA DE UI)
  const onContinuar = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Error de Validación', validationError);
      return;
    }

    setLoading(true);
    try {
      // ✅ USAR FUNCIÓN DE AUTH.TS
      await register({
        name: `${nombre.trim()} ${apellidos.trim()}`,
        email: email.trim().toLowerCase(),
        password: password,
        relationship: parentesco,
        group_uuid: grupoFamiliar.trim() || null
      });

      // ✅ MOSTRAR BANNER COMO ANTES
      setShowBanner(true);
      setLoading(false);

    } catch (error: any) {
      setLoading(false);
      
      let errorMessage = 'Hubo un error al registrar. Intenta nuevamente.';
      if (error.message.includes('email ya está registrado')) {
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // ✅ VERIFICACIÓN DE CÓDIGO CON LÓGICA CONDICIONAL CORREGIDA
  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Ingresa un código de 6 dígitos válido');
      return;
    }

    setVerificationLoading(true);
    
    try {
      await verifyEmail({
        email: email.trim().toLowerCase(),
        code: verificationCode.trim()
      });

      setShowBanner(false);

      // ✅ LÓGICA CONDICIONAL: Si hay grupo familiar, ir directo al AppHome
      if (grupoFamiliar.trim()) {
        console.log('🏠 [REGISTRO] Usuario con grupo familiar, navegando directamente a MainTabs');
        
        // ✅ USAR getParent() PARA NAVEGAR AL ROOT STACK
        navigation.getParent()?.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        
      } else {
        // Si no hay grupo familiar, continuar con el flujo normal
        console.log('📝 [REGISTRO] Usuario sin grupo familiar, continuando flujo de registro');
        
        Alert.alert(
          '¡Cuenta Verificada!',
          'Tu cuenta ha sido verificada exitosamente. Ahora completaremos tu registro.',
          [{ 
            text: 'Continuar',
            // ✅ AHORA SÍ FUNCIONA - NAVEGAR DENTRO DEL REGISTRO STACK
            onPress: () => navigation.navigate('RegistroCuidadorOne')
          }]
        );
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Código de verificación inválido o expirado.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // ✅ REENVIAR CÓDIGO
  const handleResendCode = async () => {
    try {
      await resendVerification({
        email: email.trim().toLowerCase()
      });
      setVerificationCode(''); // Limpiar código anterior
      Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu email.');
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo reenviar el código. Intenta más tarde.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ✅ AGREGAR SCROLLVIEW AQUÍ */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Ionicons name="mic-outline" size={64} color={colors.primary} />
        </View>

        <Text style={styles.titulo}>Datos personales</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#AAA"
          editable={!loading}
        />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su apellido/s"
          value={apellidos}
          onChangeText={setApellidos}
          placeholderTextColor="#AAA"
          editable={!loading}
        />

        {/* ✅ AGREGAR CAMPOS NECESARIOS PARA BACKEND */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="ejemplo@correo.com"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#AAA"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres" // ✅ CAMBIAR PLACEHOLDER
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#AAA"
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="Repita su contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#AAA"
          secureTextEntry
          editable={!loading}
        />

        <Text style={styles.label}>Fecha de nacimiento (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
          placeholderTextColor="#AAA"
          editable={!loading}
        />

        <Text style={styles.label}>¿Cuál es su parentesco con la persona que padece Alzheimer?</Text>
        <Pressable 
          style={styles.input} 
          onPress={() => !loading && setModalVisible(true)}
        >
          <Text style={{ color: parentesco ? colors.text : "#AAA" }}>
            {parentesco ? parentesco : "Seleccione..."}
          </Text>
        </Pressable>

        <Text style={styles.label}>Código de grupo familiar (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Si tienes un código de grupo, ingrésalo aquí"
          value={grupoFamiliar}
          onChangeText={setGrupoFamiliar}
          placeholderTextColor="#AAA"
          editable={!loading}
        />
        
        {/* ✅ AGREGAR HINT VISUAL SI HAY GRUPO FAMILIAR */}
        {grupoFamiliar.trim() && (
          <View style={styles.groupHint}>
            <Ionicons name="people-outline" size={16} color={colors.primary} />
            <Text style={styles.groupHintText}>
              Te unirás a un grupo familiar existente
            </Text>
          </View>
        )}

        {/* Checkbox Términos y condiciones */}
        <Pressable
          onPress={() => setTermsAccepted(v => !v)}
          style={styles.termsRow}
          disabled={loading}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: termsAccepted }}
        >
          <View style={[styles.checkboxBox, termsAccepted && { backgroundColor: colors.primary }]}>
            {termsAccepted && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.termsText}>
            Autorizo a Vocare a almacenar una replicación de voz entregada por el usuario
          </Text>
        </Pressable>

        {/* Botón continuar */}
        <Pressable 
          style={[styles.btn, (!termsAccepted || loading) && { opacity: 0.6 }]}
          onPress={onContinuar} 
          disabled={loading || !termsAccepted}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnLabel}>Continuar</Text>
          }
        </Pressable>

      </ScrollView>

      {/* ✅ MODALES FUERA DEL SCROLLVIEW */}
      {/* Modal de selección de parentesco */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona el parentesco:</Text>
            {parentescos.map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setParentesco(item);
                  setModalVisible(false);
                }}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
              </TouchableOpacity>
            ))}
            <Pressable onPress={() => setModalVisible(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Banner verificacion */}
      <Modal
        visible={showBanner}
        transparent
        animationType="fade"
        onRequestClose={() => !verificationLoading && setShowBanner(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.banner}>
            <Ionicons name="mail-outline" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.bannerTitle}>
              Se envió un código de verificación a:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>
            </Text>
            <Text style={styles.bannerSubtitle}>
              Inserte el código de 6 dígitos:
            </Text>
            
            {/* ✅ INPUT DE CÓDIGO FUNCIONAL */}
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="______"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="numeric"
                maxLength={6}
                editable={!verificationLoading}
                placeholderTextColor={colors.primary + '50'}
              />
            </View>

            {/* ✅ BOTONES DE ACCIÓN */}
            <View style={styles.bannerButtons}>
              <Pressable 
                onPress={handleVerifyCode}
                disabled={verificationLoading || verificationCode.length !== 6}
                style={[
                  styles.verifyButton,
                  { opacity: (verificationLoading || verificationCode.length !== 6) ? 0.6 : 1 }
                ]}
              >
                {verificationLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                )}
              </Pressable>
              
              <Pressable 
                onPress={handleResendCode}
                disabled={verificationLoading}
                style={styles.resendButton}
              >
                <Text style={styles.resendButtonText}>Reenviar</Text>
              </Pressable>
            </View>

            {/* ✅ MOSTRAR MENSAJE DIFERENTE SI HAY GRUPO FAMILIAR */}
            {grupoFamiliar.trim() && (
              <View style={styles.groupMessage}>
                <Ionicons name="people" size={16} color={colors.primary} />
                <Text style={styles.groupMessageText}>
                  Después de verificar te unirás al grupo familiar
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ✅ ESTILOS ACTUALIZADOS
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  scrollContent: { 
    padding: 24,
    paddingBottom: 40,
  },
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
  titulo: {
    color: colors.primary,
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: spacing.lg, 
    alignSelf: 'center',
  },
  label: {
    fontSize: 13, 
    color: colors.text, 
    marginBottom: 4, 
    marginTop: 8, 
    fontWeight: '700'
  },
  input: {
    borderWidth: 1, 
    borderColor: "#DDD", 
    borderRadius: 8,
    padding: 12, 
    fontSize: 16, 
    marginBottom: 8, 
    backgroundColor: "#F8F7FC",
  },
  // ✅ NUEVO: Hint para grupo familiar
  groupHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FF',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  groupHintText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  btn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 6,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  termsText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  btnLabel: {
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16
  },
  // Modal de parentesco
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: '80%',
    maxWidth: 340,
    elevation: 4,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE'
  },
  modalOptionText: {
    color: '#222',
    fontSize: 16
  },
  modalCancel: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Banner de verificación
  overlay: {
    flex: 1, 
    backgroundColor: 'rgba(44,0,44,0.14)', 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  banner: {
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 26, 
    minWidth: 320, 
    alignItems: 'center',
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.10, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 3 },
  },
  bannerTitle: { 
    color: colors.text, 
    fontSize: 17, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 6 
  },
  bannerSubtitle: { 
    color: colors.text, 
    fontSize: 16, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  codeContainer: { 
    marginTop: 10, 
    marginBottom: 10, 
    flexDirection: 'row', 
    justifyContent: 'center' 
  },
  codeInput: { 
    fontSize: 32, 
    letterSpacing: 6, 
    color: colors.primary, 
    fontWeight: '800', 
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
    minWidth: 200,
  },
  bannerButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '100%',
    alignItems: 'center'
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resendButtonText: {
    color: colors.primary,
    textDecorationLine: 'underline'
  },
  // ✅ NUEVO: Mensaje para grupo familiar
  groupMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FF',
    borderRadius: 8,
  },
  groupMessageText: {
    marginLeft: 6,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
