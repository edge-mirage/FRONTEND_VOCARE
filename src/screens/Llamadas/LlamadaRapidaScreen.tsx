// src/screens/Llamadas/LlamadaRapidaScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function LlamadaRapidaScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Llamada Rápida" />
      <View style={{padding: spacing.xl}}>
        <Text>Menu para iniciar una llamada (agregar contexto, etc)</Text>
      </View>
    </View>
  );
}