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

export default function VerifyCodeScreen({ route, navigation }: any) {
  const { email, newPassword } = route.params;
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

  // ✅ CORREGIR: Usar la función del CRUD
  const handleVerifyCode = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Verificando código y cambiando contraseña...');
      console.log('📧 Email:', email);
      console.log('🔑 Código:', verificationCode);

      // ✅ USAR LA FUNCIÓN DEL CRUD
      const response = await cambiarContrasenaConCodigo(
        email.toLowerCase().trim(),
        verificationCode.toUpperCase().trim(),
        newPassword
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
      console.error('❌ Response data:', e.response?.data);
      console.error('❌ Response status:', e.response?.status);
      
      // ✅ Mejor manejo de errores específicos
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
      } else if (e.code === 'ECONNABORTED' || e.message.includes('timeout')) {
        setError('Conexión lenta. Por favor, intenta nuevamente.');
      } else if (e.code === 'NETWORK_ERROR') {
        setError('Sin conexión. Verifica tu internet.');
      } else {
        setError('Error al cambiar contraseña. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ MANTENER handleResendCode con axios directo
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      console.log('📤 Reenviando código a:', email);
      
      await axios.post(`${URL}/user/recover-password`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
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
      <Header title="Verificar Código" />
      <View style={styles.container}>
        <Text style={styles.instructions}>
          Hemos enviado un código de verificación de 6 dígitos a:
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.subInstructions}>
          El código expira en 30 minutos
        </Text>

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
            <Text style={styles.buttonText}>Verificar Código</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.resendButton, resendLoading && { opacity: 0.5 }]} // ✅ Faltaba cerrar corchete aquí
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