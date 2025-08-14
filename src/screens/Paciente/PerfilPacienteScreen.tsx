// src/screens/Paciente/PerfilPacienteScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function PerfilPacienteScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Perfil Paciente" />
      <View style={{padding: spacing.xl}}>
        <Text>Acá debería ir la información del paciente</Text>
      </View>
    </View>
  );
}
