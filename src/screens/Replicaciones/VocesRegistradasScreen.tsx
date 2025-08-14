// src/screens/Replicaciones/VocesRegistradas.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function VocesRegistradasScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Voces Replicadas" />
      <View style={{padding: spacing.xl}}>
        <Text>Menú para ver las voces que han sido replicadas</Text>
      </View>
    </View>
  );
}
