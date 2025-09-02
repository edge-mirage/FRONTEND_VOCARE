// src/screens/RegistroScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing } from '@/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const parentescos = [
  'Padre/Madre',
  'Hijo/a',
  'Nieto/a',
  'Cónyuge',
  'Hermano/a',
  'Otro',
];

export default function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [parentesco, setParentesco] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [correo] = useState('ejemplodeusuario@gmail.com'); // mockeado
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // ----- ENVIAR DATOS AL BACKEND -----
  const onContinuar = async () => {
    setLoading(true);
    try {
      // ===== MOCK: aquí llamas al backend con fetch/supabase/etc =====
      /*
      const res = await fetch('https://tu-backend.com/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre, apellidos, fechaNacimiento, parentesco, correo
        }),
      });
      if (!res.ok) throw new Error('Error en el registro');
      */
      setTimeout(() => {
        setShowBanner(true);
        setLoading(false);
      }, 1200); // simula espera
    } catch (err) {
      setLoading(false);
      Alert.alert('Hubo un error al registrar. Intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
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
      />

      <Text style={styles.label}>Apellidos</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su apellido/s"
        value={apellidos}
        onChangeText={setApellidos}
        placeholderTextColor="#AAA"
      />

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={fechaNacimiento}
        onChangeText={setFechaNacimiento}
        placeholderTextColor="#AAA"
      />

      <Text style={styles.label}>¿Cuál es su parentesco con la persona que padece Alzheimer?</Text>
      <Pressable style={styles.input} onPress={() => setModalVisible(true)}>
        <Text style={{ color: parentesco ? colors.text : "#AAA" }}>
          {parentesco ? parentesco : "Seleccione..."}
        </Text>
      </Pressable>

      {/* Modal de selección de parentesco */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 24,
            minWidth: '80%',
            maxWidth: 340,
            elevation: 4,
            alignItems: 'stretch'
          }}>
            <Text style={{ fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>Selecciona el parentesco:</Text>
            {parentescos.map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setParentesco(item);
                  setModalVisible(false);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#EEE'
                }}
              >
                <Text style={{ color: '#222', fontSize: 16 }}>{item}</Text>
              </TouchableOpacity>
            ))}
            <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 16 }}>
              <Text style={{ color: colors.primary, textAlign: 'center' }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Botón continuar */}
      <Pressable style={styles.btn} onPress={onContinuar} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnLabel}>Continuar</Text>
        }
      </Pressable>

      {/* --- BANNER VERIFICACION --- */}
      <Modal
        visible={showBanner}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBanner(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.banner}>
            <Ionicons name="reload-circle-outline" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={styles.bannerTitle}>
              Se envió un código de verificación a:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>{correo}</Text>
            </Text>
            <Text style={styles.bannerSubtitle}>
              Inserte el código de 6 dígitos:
            </Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeInput}>_  _  _  _  _  _</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  logoWrap: {
    alignSelf: 'center', marginBottom: 16, marginTop: 16,
    width: 86, height: 86, borderRadius: 43, backgroundColor: '#F7F0FF',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: {
    color: colors.primary,
    fontSize: 20, fontWeight: '700', marginBottom: spacing.lg, alignSelf: 'center',
  },
  label: {
    fontSize: 13, color: colors.text, marginBottom: 4, marginTop: 8, fontWeight: '700'
  },
  input: {
    borderWidth: 1, borderColor: "#DDD", borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 8, backgroundColor: "#F8F7FC",
  },
  btn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
  },
  btnLabel: {
    color: '#fff', fontWeight: '700', fontSize: 16
  },
  // Banner de verificación
  overlay: {
    flex: 1, backgroundColor: 'rgba(44,0,44,0.14)', alignItems: 'center', justifyContent: 'center'
  },
  banner: {
    backgroundColor: '#fff', borderRadius: 12, padding: 26, minWidth: 320, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  bannerTitle: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  bannerSubtitle: { color: colors.text, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  codeContainer: { marginTop: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'center' },
  codeInput: { fontSize: 32, letterSpacing: 6, color: colors.primary, fontWeight: '800', alignSelf: 'center' },
});
