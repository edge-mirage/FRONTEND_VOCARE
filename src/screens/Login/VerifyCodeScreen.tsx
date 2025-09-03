import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing } from '@/theme';
import Header from '@/components/Header';
import axios from 'axios';
import { URL, cambiarContrasenaConCodigo } from '@/crud/user';
import { verifyEmail } from '@/crud/auth'; // ✅ AGREGAR IMPORT

export default function VerifyCodeScreen({ route, navigation }: any) {
  // ✅ DISTINGUIR ENTRE LOS DOS CASOS
  const { email, newPassword, isEmailVerification } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus siguiente input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !code[index]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ FUNCIÓN PARA VERIFICACIÓN DE EMAIL (NUEVO)
  const handleEmailVerification = async (verificationCode: string) => {
    try {
      console.log('📧 Verificando email...');
      console.log('📧 Email:', email);
      console.log('🔑 Código:', verificationCode);

      await verifyEmail({
        email: email.toLowerCase().trim(),
        code: verificationCode.trim()
      });

      console.log('✅ Email verificado exitosamente');

      // ✅ Limpiar código después del éxito
      setCode(['', '', '', '', '', '']);

      Alert.alert(
        '🎉 ¡Email Verificado!',
        'Tu email ha sido verificado exitosamente. Ahora puedes iniciar sesión.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ],
        { cancelable: false }
      );

    } catch (e: any) {
      console.error('❌ Error verificando email:', e);
      
      // ✅ Manejo de errores específicos para verificación de email
      if (e.message.includes('inválido') || e.message.includes('expirado')) {
        setError('Código incorrecto o expirado. Solicita uno nuevo.');
      } else if (e.message.includes('ya está verificado')) {
        setError('El email ya está verificado. Puedes iniciar sesión.');
      } else {
        setError('Error al verificar email. Intenta nuevamente.');
      }
      
      throw e; // Re-throw para que handleVerifyCode maneje el loading
    }
  };

  // ✅ FUNCIÓN PARA CAMBIO DE CONTRASEÑA (EXISTENTE)
  const handlePasswordChange = async (verificationCode: string) => {
    try {
      console.log('🔐 Verificando código y cambiando contraseña...');
      console.log('📧 Email:', email);
      console.log('🔑 Código:', verificationCode);

      // ✅ USAR LA FUNCIÓN DEL CRUD (REQUIERE newPassword)
      const response = await cambiarContrasenaConCodigo(
        email.toLowerCase().trim(),
        verificationCode.toUpperCase().trim(),
        newPassword // ✅ MANTENER newPassword para cambio de contraseña
      );

      console.log('✅ Contraseña cambiada exitosamente:', response);

      // ✅ Limpiar código después del éxito
      setCode(['', '', '', '', '', '']);

      Alert.alert(
        '🎉 ¡Éxito!',
        'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'Ir al Login',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ],
        { cancelable: false }
      );

    } catch (e: any) {
      console.error('❌ Error cambiando contraseña:', e);
      
      // ✅ Manejo de errores específicos para cambio de contraseña
      if (e.response?.status === 400) {
        const detail = e.response.data?.detail || 'Código inválido';
        if (detail.includes('expirado') || detail.includes('expired')) {
          setError('El código ha expirado. Solicita uno nuevo.');
        } else if (detail.includes('inválido') || detail.includes('invalid')) {
          setError('Código incorrecto. Verifica el código del email.');
        } else {
          setError(detail);
        }
      } else if (e.response?.status === 404) {
        setError('Usuario no encontrado');
      } else {
        setError('Error al cambiar contraseña. Intenta nuevamente.');
      }
      
      throw e; // Re-throw para que handleVerifyCode maneje el loading
    }
  };

  // ✅ FUNCIÓN PRINCIPAL QUE DECIDE QUÉ HACER
  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ DECIDIR SEGÚN EL TIPO DE VERIFICACIÓN
      if (isEmailVerification) {
        await handleEmailVerification(verificationCode);
      } else {
        // ✅ VERIFICAR QUE TENEMOS newPassword para cambio de contraseña
        if (!newPassword) {
          throw new Error('Falta la nueva contraseña para el cambio');
        }
        await handlePasswordChange(verificationCode);
      }

    } catch (e: any) {
      // Los errores específicos ya se manejan en las funciones individuales
      console.error('❌ Error en verificación:', e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REENVÍO SEGÚN EL TIPO
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      console.log('📤 Reenviando código a:', email);
      
      if (isEmailVerification) {
        // ✅ PARA VERIFICACIÓN DE EMAIL - usar función de auth
        const { resendVerification } = await import('@/crud/auth');
        await resendVerification({ email: email });
      } else {
        // ✅ PARA CAMBIO DE CONTRASEÑA - usar endpoint directo
        await axios.post(`${URL}/users/recover-password`, {
          email: email
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
      }
      
      setCode(['', '', '', '', '', '']);
      setError('');
      
      Alert.alert(
        'Código Reenviado', 
        'Se ha enviado un nuevo código de verificación a tu email. Por favor, revisa tu bandeja de entrada.',
        [{ text: 'Entendido' }]
      );
    } catch (e: any) {
      console.error('❌ Error reenviando código:', e);
      Alert.alert('Error', 'No se pudo reenviar el código. Inténtalo más tarde.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.card }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={isEmailVerification ? "Verificar Email" : "Verificar Código"} />
      <View style={styles.container}>
        <Text style={styles.instructions}>
          {isEmailVerification 
            ? "Hemos enviado un código de verificación de 6 dígitos a:"
            : "Hemos enviado un código de verificación de 6 dígitos a:"
          }
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.subInstructions}>
          El código expira en 30 minutos
        </Text>

        {/* ✅ EL RESTO DEL CÓDIGO DE LA UI PERMANECE IGUAL */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputRefs.current[index] = ref;
              }}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(index);
                }
              }}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleVerifyCode}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEmailVerification ? "Verificar Email" : "Verificar Código"}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.resendButton, resendLoading && { opacity: 0.5 }]}
          onPress={handleResendCode}
          disabled={resendLoading || loading}
        >
          {resendLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.resendButtonText}>Reenviar código</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ✅ ESTILOS PERMANECEN IGUALES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  instructions: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: colors.divider,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    backgroundColor: '#fff',
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: '#f8f9ff',
  },
  codeInputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    backgroundColor: colors.divider,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#e74c3c',
    marginBottom: spacing.md,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
  },
});