// src/screens/Paciente/TemporalScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function TemporalScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Pantalla de Ejemplo" />
      <View style={{padding: spacing.xl}}>
        <Text>Esto hay que cambiarlo</Text>
      </View>
    </View>
  );
}