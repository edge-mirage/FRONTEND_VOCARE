// src/screens/Registro/RegistroSolicitaGUID.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing } from '@/theme';

export default function RegistroSolicitaGUID({ navigation }: any) {
  const [guid, setGuid] = useState('');

  const handleSubmit = () => {
    // Versión solo MOCK: solo verifica que no esté vacío
    if (!guid.trim()) {
      Alert.alert('Por favor ingresa el código de grupo.');
      return;
    }
    Alert.alert('¡Código ingresado!');
    // Aquí podrías navegar a la siguiente screen si quieres
    // navigation.navigate('MainTabs'); // o la que corresponda
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo grande */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/logo-light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>¡Solo un paso más!</Text>
        <Text style={styles.subtitle}>
          Solicite el código de grupo (GUID){"\n"}
          al cuidador principal para ingresar{"\n"}
          al grupo familiar asociado
        </Text>

        <TextInput
          style={styles.input}
          placeholder="#DDDDDD"
          value={guid}
          onChangeText={setGuid}
          placeholderTextColor="#AAA"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={20}
        />

        <Pressable style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnLabel}>¡Listo!</Text>
        </Pressable>

        <Text style={styles.altTitle}>Alternativamente</Text>
        <Text style={styles.altText}>
          Puede ingresar el link de invitación{"\n"}
          que el cuidador principal puede enviar
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 28,
    paddingTop: 38,
    backgroundColor: '#ffffffff',
  },
  logoWrap: {
    borderWidth: 2,
    borderColor: '#8A5FE9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    backgroundColor: '#fff',
  },
  logo: {
    width: 96,
    height: 96,
  },
  title: {
    color: '#40135B',
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
    borderRadius: 8,
    marginBottom: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  subtitle: {
    color: '#40135B',
    fontSize: 14,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
    borderRadius: 8,
    marginBottom: 20,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#BBB',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 2,
  },
  btn: {
    backgroundColor: '#40135B',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 26,
    elevation: 2,
  },
  btnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 1,
  },
  altTitle: {
    color: '#40135B',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 14,
    marginBottom: 2,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
    borderRadius: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  altText: {
    color: '#40135B',
    fontSize: 13,
    backgroundColor: '#fff',
    width: '100%',
    textAlign: 'center',
    borderRadius: 8,
    paddingVertical: 5,
    overflow: 'hidden',
  },
});
