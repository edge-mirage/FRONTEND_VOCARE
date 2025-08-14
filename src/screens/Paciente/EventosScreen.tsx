// src/screens/Paciente/EventosScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function EventosScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Eventos" />
      <View style={{padding: spacing.xl}}>
        <Text>Lista de Eventos</Text>
      </View>
    </View>
  );
}