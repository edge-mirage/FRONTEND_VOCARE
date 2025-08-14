// src/screens/Llamadas/LlamadasHomeScreen.tsx
import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {LlamadaStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<LlamadaStackParamList>;

export default function LlamadasHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="Llamadas" onInfoPress={() => { /* abrir modal info */ }} />
      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          variant='primary'
          icon="call"
          title="Llamada Instantánea"
          subtitle="Inicia una llamada genérica inmediatamente"
          onPress={() => navigation.navigate('LlamadaInstantanea')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="call-outline"
          title="Llamada rápida"
          subtitle="Inicie una llamada con una configuración rápida"
          onPress={() => navigation.navigate('LlamadaRapida')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="calendar-clear-outline"
          title="Agendar Llamadas"
          subtitle="Programe llamadas con fecha y horas específicas"
          onPress={() => navigation.navigate('AgendarLlamada')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="document-text-outline"
          title="Contextos de Llamada"
          subtitle="Defina contextos para dirigir la conversación de las llamadas"
          onPress={() => navigation.navigate('ContextosDeLlamada')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
});
