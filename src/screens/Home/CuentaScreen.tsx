// src/screens/Home/CuentaScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Alert, 
  TextInput, 
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { logoutAccess } from '@/crud/auth';
import { useAuth } from '@/context/AuthContext';
import { 
  obtenerPerfil, 
  actualizarPerfil, 
  ActualizarPerfilData, 
  Usuario,
  verificarEmail,
  reenviarCodigoVerificacion
} from '@/crud/user';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CuentaScreen({ navigation }: any) {
  const { user, checkAuthState } = useAuth();
  
  // Estados para el perfil
  const [profileData, setProfileData] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // ✅ Estados para verificación de email (usando mismo estilo que RegistroScreen)
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  
  // Estados para el formulario de edición
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Cargar perfil al montar el componente
  useEffect(() => {
    if (user?.id) {
      cargarPerfil();
    }
  }, [user]);

  const cargarPerfil = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      console.log('👤 [CUENTA] Cargando perfil para user_id:', user.id);
      
      const perfil = await obtenerPerfil(user.id);
      setProfileData(perfil);
      
      // Inicializar formulario con datos actuales
      setEditForm({
        name: perfil.name || '',
        email: perfil.email || '',
        phone: perfil.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      console.log('✅ [CUENTA] Perfil cargado:', perfil);
      
    } catch (error) {
      console.error('❌ [CUENTA] Error cargando perfil:', error);
      Alert.alert('Error', 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Abrir modal de verificación (estilo RegistroScreen)
  const abrirModalVerificacion = () => {
    setVerificationCode('');
    setVerificationModalVisible(true);
  };

  // ✅ Navegar a VerifyCodeScreen para verificación
  const navegarAVerificarCodigo = () => {
    if (!profileData?.email) return;
    
    navigation.navigate('VerifyCode', {
      email: profileData.email,
      isEmailVerification: true, // ✅ Indicar que es verificación de email
    });
  };

  // ✅ Verificar email con código (usando el modal banner)
  const handleVerifyCode = async () => {
    if (!profileData?.email || !verificationCode.trim() || verificationCode.length !== 6) {
      Alert.alert('Error', 'Ingresa un código de 6 dígitos válido');
      return;
    }

    setVerificationLoading(true);
    
    try {
      await verificarEmail(profileData.email, verificationCode.trim());

      setVerificationModalVisible(false);
      
      Alert.alert(
        '¡Email Verificado!',
        'Tu email ha sido verificado exitosamente.',
        [{ 
          text: 'OK',
          onPress: () => {
            cargarPerfil(); // Recargar perfil
            checkAuthState(); // Actualizar contexto
          }
        }]
      );

    } catch (error: any) {
      console.error('❌ [CUENTA] Error verificando email:', error);
      let errorMessage = 'Código de verificación inválido o expirado';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  // ✅ Reenviar código de verificación
  const handleResendCode = async () => {
    if (!profileData?.email) return;
    
    setSendingCode(true);
    try {
      await reenviarCodigoVerificacion(profileData.email);
      setVerificationCode('');
      Alert.alert('Código Reenviado', 'Se ha enviado un nuevo código a tu email.');
    } catch (error: any) {
      console.error('❌ [CUENTA] Error reenviando código:', error);
      Alert.alert('Error', 'No se pudo reenviar el código. Intenta más tarde.');
    } finally {
      setSendingCode(false);
    }
  };

  const abrirModalEdicion = () => {
    if (profileData) {
      setEditForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
    setEditModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!user?.id) return;

    try {
      // Validaciones básicas
      if (!editForm.name.trim()) {
        Alert.alert('Error', 'El nombre es requerido');
        return;
      }

      if (!editForm.email.trim()) {
        Alert.alert('Error', 'El email es requerido');
        return;
      }

      // Validar contraseña nueva si se proporcionó
      if (editForm.new_password && editForm.new_password !== editForm.confirm_password) {
        Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
        return;
      }

      if (editForm.new_password && editForm.new_password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      setSaving(true);
      console.log('💾 [CUENTA] Guardando cambios...');

      // Preparar datos para actualizar
      const updateData: ActualizarPerfilData = {
        user_id: user.id,
        name: editForm.name.trim(),
        email: editForm.email.toLowerCase().trim(),
        phone: editForm.phone.trim() || undefined
      };

      // Agregar contraseñas solo si se van a cambiar
      if (editForm.new_password) {
        if (!editForm.current_password) {
          Alert.alert('Error', 'Debes ingresar tu contraseña actual para cambiarla');
          return;
        }
        updateData.current_password = editForm.current_password;
        updateData.new_password = editForm.new_password;
      }

      const resultado = await actualizarPerfil(updateData);
      
      console.log('✅ [CUENTA] Perfil actualizado:', resultado);

      // Mostrar mensaje de éxito
      let mensaje = 'Perfil actualizado exitosamente';
      if (resultado.email_verification_required) {
        mensaje += '\n\nSe envió un código de verificación a tu nuevo email.';
      }

      Alert.alert('Éxito', mensaje, [
        {
          text: 'OK',
          onPress: () => {
            setEditModalVisible(false);
            cargarPerfil(); // Recargar perfil
            if (resultado.email_verification_required) {
              // Si cambió el email, actualizar el contexto de autenticación
              checkAuthState();
            }
          }
        }
      ]);

    } catch (error: any) {
      console.error('❌ [CUENTA] Error guardando cambios:', error);
      
      let errorMessage = 'Error actualizando el perfil';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    console.log('🔵 [LOGOUT] handleLogout fue llamado');
    
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            console.log('🔵 [LOGOUT] Botón "Cerrar Sesión" presionado');
            try {
              console.log('🔵 [LOGOUT] Llamando logoutAccess...');
              await logoutAccess();
              console.log('🔵 [LOGOUT] logoutAccess completado');
              
              console.log('🔵 [LOGOUT] Llamando checkAuthState...');
              await checkAuthState();
              console.log('🔵 [LOGOUT] checkAuthState completado');
            } catch (error) {
              console.error('❌ [LOGOUT] Error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Mi Cuenta" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Mi Cuenta" />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ✅ ALERTA DE EMAIL NO VERIFICADO (estilo warning simple) */}
        {profileData && !profileData.email_verified && (
          <View style={styles.warningContainer}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={24} color="#856404" />
              <Text style={styles.warningTitle}>Email no verificado</Text>
            </View>
            <Text style={styles.warningText}>
              Tu email no ha sido verificado. Algunos servicios pueden estar limitados.
            </Text>
            <View style={styles.verificationOptions}>
              <Pressable
                style={styles.verifyOptionButton}
                onPress={abrirModalVerificacion}
              >
                <Text style={styles.verifyOptionText}>Verificar aquí</Text>
              </Pressable>
              <Text style={styles.verifyOptionSeparator}>o</Text>
              <Pressable
                style={styles.verifyOptionButton}
                onPress={navegarAVerificarCodigo}
              >
                <Text style={styles.verifyOptionText}>Ir a pantalla completa</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Información del Usuario */}
        {profileData && (
          <View style={styles.userInfo}>
            <View style={styles.userHeader}>
              <Text style={styles.userTitle}>Información del Usuario</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  pressed && { opacity: 0.8 }
                ]}
                onPress={abrirModalEdicion}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>
            </View>
            
            <View style={styles.userDetails}>
              <View style={styles.userDetailRow}>
                <Text style={styles.userDetailLabel}>Nombre:</Text>
                <Text style={styles.userDetailValue}>{profileData.name}</Text>
              </View>
              
              <View style={styles.userDetailRow}>
                <Text style={styles.userDetailLabel}>Email:</Text>
                <View style={styles.emailContainer}>
                  <Text style={styles.userDetailValue}>{profileData.email}</Text>
                  {profileData.email_verified ? (
                    <View style={styles.statusContainer}>
                      <Ionicons name="checkmark-circle" size={16} color="#28a745" />
                      <Text style={styles.verifiedText}>Verificado</Text>
                    </View>
                  ) : (
                    <View style={styles.statusContainer}>
                      <Ionicons name="alert-circle" size={16} color="#dc3545" />
                      <Text style={styles.unverifiedText}>No verificado</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {profileData.phone && (
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Teléfono:</Text>
                  <Text style={styles.userDetailValue}>{profileData.phone}</Text>
                </View>
              )}
              
              {profileData.created_at && (
                <View style={styles.userDetailRow}>
                  <Text style={styles.userDetailLabel}>Miembro desde:</Text>
                  <Text style={styles.userDetailValue}>
                    {new Date(profileData.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Botón de Cerrar Sesión */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>

      {/* Modal de Edición */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Información Básica */}
              <Text style={styles.sectionTitle}>Información Básica</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.inputHint}>
                  Si cambias el email, necesitarás verificarlo nuevamente
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Teléfono</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({...editForm, phone: text})}
                  placeholder="+1 234 567 8900"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Cambiar Contraseña */}
              <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
              <Text style={styles.sectionSubtitle}>
                Deja en blanco si no quieres cambiar tu contraseña
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña Actual</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.current_password}
                  onChangeText={(text) => setEditForm({...editForm, current_password: text})}
                  placeholder="Tu contraseña actual"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nueva Contraseña</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.new_password}
                  onChangeText={(text) => setEditForm({...editForm, new_password: text})}
                  placeholder="Nueva contraseña (mínimo 6 caracteres)"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.confirm_password}
                  onChangeText={(text) => setEditForm({...editForm, confirm_password: text})}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                />
              </View>
            </ScrollView>

            {/* Botones del Modal */}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={guardarCambios}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ✅ Modal de Verificación (estilo RegistroScreen banner) */}
      <Modal
        visible={verificationModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !verificationLoading && setVerificationModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.banner}>
            <Ionicons name="mail-outline" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.bannerTitle}>
              Se envió un código de verificación a:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>{profileData?.email}</Text>
            </Text>
            <Text style={styles.bannerSubtitle}>
              Inserte el código de 6 dígitos:
            </Text>
            
            {/* Input de código */}
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

            {/* Botones de acción */}
            <View style={styles.bannerButtons}>
              <Pressable 
                onPress={handleVerifyCode}
                disabled={verificationLoading}
                style={[styles.bannerButton, styles.verifyButton]}
              >
                {verificationLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verificar</Text>
                )}
              </Pressable>
              
              <Pressable 
                onPress={handleResendCode}
                disabled={sendingCode || verificationLoading}
                style={styles.resendLink}
              >
                {sendingCode ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={styles.resendText}>Reenviar</Text>
                )}
              </Pressable>
            </View>

            {/* Botón cerrar */}
            <Pressable 
              onPress={() => setVerificationModalVisible(false)}
              disabled={verificationLoading}
              style={styles.closeModalButton}
            >
              <Text style={styles.closeModalText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 16,
  },
  // ✅ Estilos para alerta de email no verificado
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginLeft: spacing.xs,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: spacing.md,
  },
  verificationOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyOptionButton: {
    backgroundColor: '#FFC107',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
  },
  verifyOptionText: {
    color: '#212529',
    fontWeight: '600',
    fontSize: 12,
  },
  verifyOptionSeparator: {
    color: '#856404',
    marginHorizontal: spacing.sm,
    fontSize: 14,
  },
  userInfo: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  userDetails: {
    gap: spacing.sm,
  },
  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    minWidth: 80,
  },
  userDetailValue: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  // ✅ Contenedor para email con estado
  emailContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginLeft: 4,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#dc3545',
    fontWeight: '600',
    marginLeft: 4,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // ✅ Estilos para modal de verificación (banner style)
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
  bannerButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  verifyButton: {
    backgroundColor: colors.primary,
  },
  verifyButtonText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  resendLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resendText: { 
    color: colors.primary, 
    textDecorationLine: 'underline' 
  },
  closeModalButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  closeModalText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});