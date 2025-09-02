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
import { login } from '@/crud/auth';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const { checkAuthState } = useAuth();

  // ✅ Cambiar NodeJS.Timeout por number
  React.useEffect(() => {
    let interval: number;
    
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number; // ✅ Cast para React Native
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBlocked, blockTimeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLogin = async () => {
    console.log('🚀 INICIO LOGIN - Iniciando login con:', { email, password: '***' });
    
    if (isBlocked) {
      Alert.alert('Cuenta Bloqueada', `Tu cuenta está bloqueada. Tiempo restante: ${formatTime(blockTimeRemaining)}`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('📡 STEP 1 - Llamando a API de login...');
      const user = await login({ email, password });
      console.log('✅ STEP 2 - Login API exitoso, usuario recibido:', JSON.stringify(user, null, 2));
      
      // Verificar que tenemos un usuario válido
      if (!user || !user.id) {
        throw new Error('Usuario retornado es null o no tiene ID');
      }
      
      // ✅ Limpiar estados de error/bloqueo al login exitoso
      setError('');
      setIsBlocked(false);
      setBlockTimeRemaining(0);
      
      console.log('🔄 STEP 3 - Actualizando estado de auth...');
      await checkAuthState();
      console.log('✅ STEP 4 - Estado de auth actualizado correctamente');
      
      // Log adicional para verificar que todo esté bien
      console.log('🎉 LOGIN COMPLETO - Usuario logueado exitosamente');
      
    } catch (e: any) {
      console.error('❌ ERROR EN LOGIN - Error completo:', e);
      console.error('❌ ERROR DETAILS:', {
        message: e.message,
        isBlocked: e.isBlocked,
        isFailedAttempt: e.isFailedAttempt,
        isEmailNotVerified: e.isEmailNotVerified,
        response: e.response,
        status: e.response?.status,
        data: e.response?.data
      });
      
      // ✅ Manejar cuenta bloqueada
      if (e.isBlocked) {
        const minutes = parseInt(e.blockedMinutes) || 10;
        const seconds = minutes * 60;
        
        setIsBlocked(true);
        setBlockTimeRemaining(seconds);
        setError(`Cuenta bloqueada por ${minutes} minutos debido a múltiples intentos fallidos.`);
        
        Alert.alert(
          '🔒 Cuenta Bloqueada', 
          `Tu cuenta ha sido bloqueada por ${minutes} minutos debido a múltiples intentos de inicio de sesión fallidos.\n\nPor favor, espera antes de intentar nuevamente.`,
          [{ text: 'Entendido', style: 'default' }]
        );
        return;
      }
      
      // ✅ Manejar intentos fallidos (pero no bloqueado aún)
      if (e.isFailedAttempt) {
        const remaining = e.remainingAttempts || '0';
        setError(`Credenciales incorrectas. Te quedan ${remaining} intentos antes del bloqueo.`);
        
        Alert.alert(
          '⚠️ Intento Fallido', 
          `Credenciales incorrectas.\n\nTe quedan ${remaining} intentos antes de que tu cuenta sea bloqueada por 10 minutos.`,
          [{ text: 'Reintentar', style: 'default' }]
        );
        return;
      }
      
      // ✅ Manejar contraseña incorrecta (nuevo)
      if (e.isWrongPassword) {
        setError('Contraseña incorrecta');
        Alert.alert(
          '🔑 Contraseña Incorrecta',
          'La contraseña que ingresaste es incorrecta. Por favor, verifica e intenta nuevamente.',
          [{ text: 'Reintentar', style: 'default' }]
        );
        return;
      }
      
      // ✅ Manejar email no verificado
      if (e.isEmailNotVerified) {
        setError('Por favor verifica tu email antes de iniciar sesión');
        Alert.alert(
          '📧 Email No Verificado',
          'Debes verificar tu email antes de poder iniciar sesión. Revisa tu bandeja de entrada y spam.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Reenviar Email', 
              onPress: () => {
                // TODO: Implementar reenvío de email de verificación
                Alert.alert('Información', 'Funcionalidad de reenvío próximamente');
              }
            }
          ]
        );
        return;
      }
      
      // ✅ Manejar otros errores específicos
      if (e.isUserNotFound) {
        setError('Usuario no encontrado');
      } else if (e.response?.status === 402) {
        setError('Contraseña incorrecta');
      } else if (e.response?.status === 200) {
        // Si el status es 200 pero llegamos aquí, hay un problema con el parseo
        console.error('❌ ERROR EXTRAÑO: Status 200 pero error en login');
        console.error('❌ Response data:', e.response?.data);
        setError('Error procesando respuesta del servidor');
      } else {
        setError('Error de conexión o servidor');
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('RecoverPassword');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.card }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Iniciar Sesión" />
      <View style={styles.container}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, isBlocked && styles.inputDisabled]}
          placeholder="usuario@correo.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isBlocked && !loading}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={[styles.input, isBlocked && styles.inputDisabled]}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isBlocked && !loading}
        />

        {/* ✅ Mostrar estado de bloqueo */}
        {isBlocked && (
          <View style={styles.blockedContainer}>
            <Text style={styles.blockedTitle}>🔒 Cuenta Bloqueada</Text>
            <Text style={styles.blockedText}>
              Tiempo restante: {formatTime(blockTimeRemaining)}
            </Text>
            <Text style={styles.blockedSubtext}>
              Tu cuenta fue bloqueada por múltiples intentos fallidos
            </Text>
          </View>
        )}

        {/* ✅ Mostrar errores */}
        {error ? (
          <Text style={[
            styles.error, 
            isBlocked && styles.errorBlocked,
            error.includes('quedan') && styles.errorWarning
          ]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.8 },
            (loading || isBlocked) && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading || isBlocked}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.buttonText,
              (isBlocked) && styles.buttonTextDisabled
            ]}>
              {isBlocked ? `Bloqueado (${formatTime(blockTimeRemaining)})` : 'Ingresar'}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
        
        {/* ✅ Información adicional para usuarios bloqueados */}
        {isBlocked && (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>💡 ¿Necesitas ayuda?</Text>
            <Text style={styles.helpText}>
              • Verifica que tu email y contraseña sean correctos{'\n'}
              • Si olvidaste tu contraseña, usa "¿Olvidaste tu contraseña?"{'\n'}
              • El bloqueo se levanta automáticamente después de 10 minutos
            </Text>
          </View>
        )}
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
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
    borderColor: '#ddd',
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
  buttonTextDisabled: {
    color: '#999',
  },
  error: {
    color: '#e74c3c',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  errorBlocked: {
    color: '#c0392b',
    fontWeight: 'bold',
  },
  errorWarning: {
    color: '#f39c12',
    fontWeight: '600',
  },
  forgotPasswordButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // ✅ Estilos para bloqueo
  blockedContainer: {
    backgroundColor: '#ffeaea',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcccb',
    marginBottom: spacing.md,
  },
  blockedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c0392b',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  blockedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  blockedSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  helpContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});
