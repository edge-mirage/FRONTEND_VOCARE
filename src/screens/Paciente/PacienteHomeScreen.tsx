// src/screens/Paciente/PacienteHomeScreen.tsx
import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {PacienteStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<PacienteStackParamList>;

export default function PacienteHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="Paciente" onInfoPress={() => { /* abrir modal info */ }} />
      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          icon="person-outline"
          title="Perfil Paciente"
          subtitle="Edite la información general de la persona cuidada"
          onPress={() => navigation.navigate('PerfilPaciente')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="pulse-outline"
          title="Síntomas"
          subtitle="Actualice los síntomas que presenta la persona cuidada"
          onPress={() => navigation.navigate('Sintomas')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="heart-outline"
          title="Intereses"
          subtitle="Ingrese intereses y pasiones de la persona cuidada"
          onPress={() => navigation.navigate('Intereses')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="calendar-clear-outline"
          title="Eventos"
          subtitle="Añada eventos importantes de la vida de la persona cuidada"
          onPress={() => navigation.navigate('Eventos')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
});
