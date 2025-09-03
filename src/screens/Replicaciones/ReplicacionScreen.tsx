import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'Replicacion'>;

export default function ReplicacionScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Replicación de Voz"
        onInfoPress={() => navigation.navigate('Informacion')}
      />

      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: '800',
            marginBottom: spacing.lg,
            color: colors.text,
          }}
        >
          Tareas de replicación
        </Text>

        {/* Contenedor sin borde */}
        <View style={{ padding: spacing.md }}>
          <CardRow
            icon="mic-outline"
            title="1. Reconocimiento de voz"
            subtitle="Grabar audio de 45 segundos repitiendo oraciones."
            onPress={() => navigation.navigate('ReconocimientoVoz')}
          />

          <View style={{ height: spacing.lg }} />

          <CardRow
            icon="pulse-outline"
            title="2. Fonética de palabras"
            subtitle="Vamos a aprender cómo pronuncias algunas palabras…"
            onPress={() => navigation.navigate('FoneticaPalabras')}
          />

          <View style={{ height: spacing.lg }} />

          <CardRow
            icon="heart-outline"
            title="3. Viva Wanderers"
            subtitle="Ingrese intereses y pasiones de la persona cuidada"
            onPress={() => navigation.navigate('VivaWanderers')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
