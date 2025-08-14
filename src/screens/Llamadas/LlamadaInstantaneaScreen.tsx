// src/screens/Llamadas/LlamadaInstantaneaScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function LlamadaInstantaneaScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Llamada Instantánea" />
      <View style={{padding: spacing.xl}}>
        <Text>Debería iniciarse una llamada de inmediato con un contexto default</Text>
      </View>
    </View>
  );
}