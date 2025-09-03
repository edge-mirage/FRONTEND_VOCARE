import React, { useState } from 'react';
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
import { URL, verificarEmailExiste } from '@/crud/user';

export default function RecoverPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState('');

  // ✅ Solo verificar que el email existe (sin enviar código aún)
  const handleVerifyEmail = async () => {
    if (!email) {
      setError('Por favor ingresa un email');
      return;
    }

    setVerifyingEmail(true);
    setError('');
    
    try {
      console.log('🔍 Verificando si email existe:', email);
      
      // ✅ USAR LA FUNCIÓN DEL CRUD
      const result = await verificarEmailExiste(email.toLowerCase().trim());
      
      console.log('✅ Resultado verificación:', result);
      
      if (result && result.exists) {
        setEmailVerified(true);
        setError('');
        Alert.alert(
          '✅ Email Verificado', 
          `Perfecto! El email pertenece a: ${result.name || 'Usuario'}`
        );
      } else {
        // Manejar diferentes tipos de error
        if (result.error_type === 'method_not_allowed') {
          setError('Error del servidor - Endpoint no disponible');
          Alert.alert('Error del Servidor', 'El servicio de verificación no está disponible. Contacta al soporte.');
        } else if (result.error_type === 'invalid_format') {
          setError('Formato de email inválido');
          Alert.alert('Formato Inválido', 'Por favor ingresa un email válido.');
        } else if (result.error_type === 'not_found') {
          setError('Email no registrado en el sistema');
          Alert.alert('Email No Encontrado', 'El email ingresado no está registrado en nuestro sistema.');
        } else {
          setError('Email no encontrado');
          Alert.alert('Email No Encontrado', result.message || 'El email no está registrado.');
        }
        setEmailVerified(false);
      }
    } catch (e: any) {
      console.error('❌ Error verificando email:', e);
      setError('Error de conexión');
      Alert.alert('Error', 'No se pudo verificar el email. Revisa tu conexión.');
      setEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  // ✅ CORREGIR: Enviar código usando axios (mantener como está)
  const handleSubmit = async () => {
    if (!emailVerified) {
      setError('Por favor verifica el email primero');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos de contraseña');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📤 Enviando código de verificación...');
      console.log('📧 Email:', email);
      console.log('🔐 Nueva contraseña longitud:', password.length);

      // ✅ MANTENER axios directo para envío de código
      const response = await axios.post(`${URL}/users/recover-password`, { 
        email: email.toLowerCase().trim() 
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });

      console.log('✅ Código enviado:', response.data);

      Alert.alert(
        '📧 Código Enviado',
        `Se ha enviado un código de verificación de 6 dígitos a tu email: ${email}\n\nRevisa tu bandeja de entrada y spam.`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              navigation.navigate('VerifyCode', { 
                email: email.toLowerCase().trim(),
                newPassword: password
              });
            }
          }
        ]
      );

    } catch (e: any) {
      console.error('❌ Error enviando código:', e);
      console.error('❌ Response:', e.response?.data);
      console.error('❌ Status:', e.response?.status);
      
      if (e.response?.status === 404) {
        setError('Usuario no encontrado');
        Alert.alert('Error', 'No se encontró el usuario. Verifica el email e intenta nuevamente.');
      } else if (e.response?.status === 500) {
        setError('Error interno del servidor');
        Alert.alert('Error', 'Hubo un problema en el servidor. Intenta más tarde.');
      } else {
        setError('Error al enviar código de verificación');
        Alert.alert('Error', 'No se pudo enviar el código. Verifica tu conexión e intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.card }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Recuperar Contraseña" />
      <View style={styles.container}>
        <Text style={styles.instructions}>
          Primero verifica que tu email existe en nuestro sistema, luego ingresa tu nueva contraseña.
        </Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <View style={styles.emailContainer}>
          <TextInput
            style={[styles.emailInput, emailVerified && styles.verifiedInput]}
            placeholder="usuario@correo.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailVerified(false); // Reset verification when email changes
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!emailVerified}
          />
          <Pressable
            style={[
              styles.verifyButton,
              emailVerified && styles.verifiedButton
            ]}
            onPress={handleVerifyEmail}
            disabled={verifyingEmail || emailVerified || !email.trim()}
          >
            {verifyingEmail ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : emailVerified ? (
              <Text style={styles.checkmarkText}>✓</Text>
            ) : (
              <Text style={styles.verifyButtonText}>Verificar</Text>
            )}
          </Pressable>
        </View>

        {emailVerified && (
          <>
            <Text style={[styles.label, styles.passwordSectionTitle]}>
              📝 Configurar Nueva Contraseña
            </Text>
            
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Repetir contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repetir nueva contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <Text style={styles.infoText}>
              💡 Al continuar se enviará un código de verificación a tu email
            </Text>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
            (loading || !emailVerified || !password || !confirmPassword) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || !emailVerified || !password || !confirmPassword}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>Enviando código...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              {emailVerified ? 'Enviar Código de Verificación' : 'Continuar'}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>Volver al login</Text>
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
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  passwordSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 6,
    padding: spacing.sm,
    backgroundColor: '#fff',
    color: colors.text,
    marginRight: spacing.sm,
  },
  verifiedInput: {
    borderColor: '#27ae60',
    backgroundColor: '#f8fff8',
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  verifiedButton: {
    backgroundColor: '#27ae60',
  },
  verifyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
    color: colors.text,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    padding: spacing.sm,
    borderRadius: 6,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.divider,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginLeft: spacing.xs,
    fontSize: 16,
  },
  error: {
    color: '#e74c3c',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
});