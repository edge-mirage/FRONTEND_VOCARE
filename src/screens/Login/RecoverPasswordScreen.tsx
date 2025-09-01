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
import { BASE_URL } from '@/crud/auth';

export default function RecoverPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyEmail = async () => {
    if (!email) {
      setError('Por favor ingresa un email');
      return;
    }

    setVerifyingEmail(true);
    setError('');
    try {
      // Verificar si el email existe
      const response = await axios.post(`${BASE_URL}/user/recover-password`, { email });
      if (response.data) {
        setEmailVerified(true);
        Alert.alert('Email verificado', 'El email existe en nuestro sistema. Ahora puedes cambiar tu contraseña.');
      }
    } catch (e: any) {
      console.error('❌ Error verificando email:', e);
      if (e.response?.status === 404) {
        setError('Email no encontrado en nuestro sistema');
      } else {
        setError('Error verificando el email');
      }
      setEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSubmit = async () => {
    if (!emailVerified) {
      setError('Por favor verifica el email primero');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
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
      // Aquí iría la llamada a la API para cambiar contraseña
      // Por ahora vamos directamente a la pantalla de verificación
      navigation.navigate('VerifyCode', { 
        email,
        newPassword: password
      });
    } catch (e: any) {
      console.error('❌ Error en recuperación:', e);
      setError('Error al procesar la solicitud');
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
          Ingresa tu email y nueva contraseña. Primero verifica que tu email existe en nuestro sistema.
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
            disabled={verifyingEmail || emailVerified}
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
            <Text style={styles.label}>Nueva contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Nueva contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Repetir contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
            (loading || !emailVerified) && { backgroundColor: colors.divider },
          ]}
          onPress={handleSubmit}
          disabled={loading || !emailVerified}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continuar</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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