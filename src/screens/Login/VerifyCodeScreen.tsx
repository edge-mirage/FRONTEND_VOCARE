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
// ✅ CORREGIR IMPORT - usar axios y BASE_URL
import axios from 'axios';
import { BASE_URL } from '@/crud/auth';

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
      console.log('🆕 Nueva contraseña longitud:', newPassword?.length || 0);

      // ✅ Usar axios directamente con BASE_URL
      const response = await axios.post(`${BASE_URL}/user/change-password-with-code`, {
        email: email,
        code: verificationCode,
        new_password: newPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000  // 15 segundos timeout
      });

      console.log('✅ Contraseña cambiada exitosamente:', response.data);

      Alert.alert(
        '🎉 ¡Éxito!',
        'Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'Ir al Login',
            onPress: () => {
              // Resetear el stack de navegación para evitar volver atrás
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        ]
      );

    } catch (e: any) {
      console.error('❌ Error cambiando contraseña:', e);
      console.error('❌ Error response:', e.response?.data);
      console.error('❌ Error status:', e.response?.status);
      
      // ✅ Manejo específico de errores
      if (e.response?.status === 400) {
        const errorDetail = e.response?.data?.detail || 'Código incorrecto o expirado';
        setError(errorDetail);
        
        // Si el código expiró, ofrecer reenviar
        if (errorDetail.toLowerCase().includes('expirado')) {
          Alert.alert(
            'Código Expirado',
            'El código de verificación ha expirado. ¿Deseas solicitar uno nuevo?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Reenviar', onPress: handleResendCode }
            ]
          );
        }
      } else if (e.response?.status === 404) {
        setError('Usuario no encontrado');
        Alert.alert('Error', 'No se encontró el usuario. Por favor, intenta el proceso desde el inicio.');
      } else if (e.response?.status === 500) {
        setError('Error interno del servidor');
        Alert.alert('Error', 'Hubo un problema en el servidor. Por favor, intenta más tarde.');
      } else if (e.code === 'ECONNABORTED') {
        setError('Tiempo de espera agotado');
        Alert.alert('Timeout', 'La conexión tardó demasiado. Verifica tu conexión a internet.');
      } else {
        setError('Error al cambiar contraseña. Inténtalo nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      console.log('📤 Reenviando código a:', email);
      
      // ✅ Llamar al endpoint de recuperar contraseña para reenviar código
      await axios.post(`${BASE_URL}/user/recover-password`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      // Limpiar el código actual
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