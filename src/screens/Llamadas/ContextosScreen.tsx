// src/screens/Llamadas/AgendarLlamadasScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function ContextosScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Contextos de Llamada" />
      <View style={{padding: spacing.xl}}>
        <Text>Menu para agregar y ver los contextos de llamadas definidos por el usuario</Text>
      </View>
    </View>
  );
}