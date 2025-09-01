// src/screens/Llamadas/AgendarLlamadasScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function AgendarLlamadasScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Llamadas Agendadas" />
      <View style={{padding: spacing.xl}}>
        <Text>Menu para programar llamadas y ver las que ya están agendadas</Text>
      </View>
    </View>
  );
}