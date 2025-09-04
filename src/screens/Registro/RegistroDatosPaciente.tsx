// src/screens/Registro/RegistroDatosPaciente.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { colors, spacing } from '@/theme';
import { Alert } from 'react-native';


export default function RegistroDatosPaciente({ navigation }: any) {
  // Campos de la persona cuidada
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [Intereses, setIntereses] = useState('');
  const [NivelDeterioro, setNivelDeterioro] = useState('');



  const onContinuar = () => {

    Alert.alert('¡Datos guardados!');
    navigation.navigate('RegistroSintomasPaciente')
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary ?? '#40135B' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Datos de la persona cuidada</Text>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Apellidos</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese su apellido/s"
          value={apellidos}
          onChangeText={setApellidos}
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
        />


        <Text style={styles.label}>Nivel de Demencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba..."
          value={NivelDeterioro}
          onChangeText={setNivelDeterioro}
        />


        <Text style={styles.label}>Intereses</Text>
        <TextInput
          style={styles.input}
          placeholder="Escriba..."
          value={Intereses}
          onChangeText={setIntereses}
        />

        <Pressable style={styles.btn} onPress={onContinuar}>
          <Text style={styles.btnLabel}>Continuar</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary ?? '#40135B',
    marginBottom: 14,
    textAlign: 'left',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary ?? '#40135B',
    //marginBottom: 18,
  },
  label: {
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    color: '#1d1336',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8F7FC",
    marginBottom: 8,
  },
  btn: {
    marginTop: 26,
    backgroundColor: colors.primary ?? '#40135B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  btnLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
