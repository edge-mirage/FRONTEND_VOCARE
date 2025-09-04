// src/screens/Registro/RegistroDatosPaciente.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';
import { createPacient } from '../../crud/pacient';
import { StorageService } from '@/services/StorageService';

export default function RegistroDatosPaciente({ navigation, route }: any) {
  // Campos de la persona cuidada
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [intereses, setIntereses] = useState('');
  const [nivelDeterioro, setNivelDeterioro] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ OBTENER grupo_uuid DESDE PARÁMETROS
  const grupo_uuid = route?.params?.grupo_uuid;

  const onContinuar = async () => {
    if (!nombre.trim() || !apellidos.trim()) {
      Alert.alert('Error', 'Por favor completa nombre y apellidos');
      return;
    }
    
    setLoading(true);
    try {
      // ✅ PREPARAR DATOS DEL PACIENTE
      const pacientData = {
        name: `${nombre.trim()} ${apellidos.trim()}`,
        age: fechaNacimiento ? calcularEdad(fechaNacimiento) : undefined,
        symptoms: [], // Inicializar vacío - se llenarán en el siguiente paso
        events: [], // Inicializar vacío
        interests: intereses
          ? intereses.split(',').map(s => ({ 
              nombre: s.trim(),
              descripcion: '' 
            })).filter(i => i.nombre) // Array de objetos como espera el backend
          : [],
        grupo_uuid,
      };

      console.log('📝 [PACIENTE] Creando paciente con datos:', pacientData);
      
      const result = await createPacient(pacientData);
      const paciente = result.data;
      
      console.log('✅ [PACIENTE] Paciente creado exitosamente:', paciente);
      
      // ✅ VERIFICAR QUE SE CREÓ CORRECTAMENTE
      if (!paciente || !paciente.id) {
        throw new Error('No se pudo crear el paciente correctamente');
      }

      // ✅ GUARDAR DATOS DEL PACIENTE EN STORAGE PARA USO POSTERIOR
      await StorageService.setPacientId(paciente.id);
      if (paciente.grupo_uuid) {
        await StorageService.setGroupUuid(paciente.grupo_uuid);
      }
      
      // ✅ CONTINUAR CON SÍNTOMAS PASANDO EL grupo_uuid
      navigation.navigate('RegistroSintomasPaciente', { 
        grupo_uuid: paciente.grupo_uuid || grupo_uuid,
        paciente_id: paciente.id
      });
      
    } catch (e: any) {
      console.error('❌ [PACIENTE] Error creando paciente:', e);
      Alert.alert('Error', e?.message || 'Error al crear paciente. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN HELPER PARA CALCULAR EDAD
  const calcularEdad = (fechaNacimiento: string) => {
    try {
      const [dia, mes, anio] = fechaNacimiento.split('/').map(Number);
      if (!dia || !mes || !anio || anio < 1900 || anio > new Date().getFullYear()) {
        return undefined;
      }
      
      const hoy = new Date();
      const cumpleanos = new Date(anio, mes - 1, dia);
      let edad = hoy.getFullYear() - cumpleanos.getFullYear();
      
      if (hoy.getMonth() < cumpleanos.getMonth() || 
          (hoy.getMonth() === cumpleanos.getMonth() && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
      }
      
      return edad > 0 ? edad : undefined;
    } catch {
      return undefined;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary ?? '#40135B' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Datos de la persona cuidada</Text>
        
        <Text style={styles.label}>Nombre *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ingrese el nombre" 
          value={nombre} 
          onChangeText={setNombre}
          editable={!loading}
        />
        
        <Text style={styles.label}>Apellidos *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ingrese los apellidos" 
          value={apellidos} 
          onChangeText={setApellidos}
          editable={!loading}
        />
        
        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TextInput 
          style={styles.input} 
          placeholder="DD/MM/AAAA" 
          value={fechaNacimiento} 
          onChangeText={setFechaNacimiento}
          editable={!loading}
        />
        
        <Text style={styles.label}>Nivel de Demencia</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Leve, Moderado, Severo..." 
          value={nivelDeterioro} 
          onChangeText={setNivelDeterioro}
          editable={!loading}
        />
        
        <Text style={styles.label}>Intereses</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: fútbol, música, lectura (separados por comas)" 
          value={intereses} 
          onChangeText={setIntereses}
          multiline
          numberOfLines={2}
          editable={!loading}
        />
        
        <Pressable 
          style={[styles.btn, loading && styles.btnDisabled]} 
          onPress={onContinuar} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnLabel}>Continuar</Text>
          )}
        </Pressable>

        {/* ✅ DEBUG INFO (SOLO EN DESARROLLO) */}
        {__DEV__ && grupo_uuid && (
          <Text style={styles.debugText}>
            Debug: grupo_uuid = {grupo_uuid.substring(0, 8)}...
          </Text>
        )}
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
    paddingBottom: 36 
  },
  titulo: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: colors.primary ?? '#40135B', 
    marginBottom: 14, 
    textAlign: 'left', 
    borderBottomWidth: 2, 
    borderBottomColor: colors.primary ?? '#40135B' 
  },
  label: { 
    fontWeight: '700', 
    marginTop: 12, 
    marginBottom: 4, 
    color: '#1d1336', 
    fontSize: 14 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#DDD", 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    backgroundColor: "#F8F7FC", 
    marginBottom: 8 
  },
  btn: { 
    marginTop: 26, 
    backgroundColor: colors.primary ?? '#40135B', 
    borderRadius: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14 
  },
  btnDisabled: {
    opacity: 0.6
  },
  btnLabel: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  debugText: { 
    fontSize: 10, 
    color: '#999', 
    textAlign: 'center', 
    marginTop: 16 
  }
});
