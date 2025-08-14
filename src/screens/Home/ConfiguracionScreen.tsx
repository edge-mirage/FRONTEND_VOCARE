// src/screens/Home/ConfiguracionScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function ConfiguracionScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Configuración" />
      <View style={{padding: spacing.xl}}>
        <Text>Hay que ver que ajustes ponemos ¿tamaño de letra, íconos?, ¿modo oscuro?</Text>
      </View>
    </View>
  );
}