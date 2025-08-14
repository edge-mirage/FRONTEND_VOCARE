// src/screens/Replicaciones/ReplicacionesScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function ReplicacionesScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Replicación de Voz" />
      <View style={{padding: spacing.xl}}>
        <Text>Listado/acciones de replicacion...</Text>
      </View>
    </View>
  );
}
