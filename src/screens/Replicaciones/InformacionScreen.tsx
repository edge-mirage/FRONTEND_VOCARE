// src/screens/Replicaciones/InformacionScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function InformacionScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Información sobre Replicación" />
      <View style={{padding: spacing.xl}}>
        <Text>Menú para ver las informaciones sobre la replicacion de voz</Text>
      </View>
    </View>
  );
}
