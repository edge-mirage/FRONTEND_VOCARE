// src/screens/Replicaciones/ReplicacionesHomeScreen.tsx
import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {ReplicacionStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList>;

export default function ReplicacionesHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="Replicación de Voz" onInfoPress={() => { /* abrir modal info */ }} />
      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          icon="information-outline"
          title="Información"
          subtitle="Revise toda la información respecto del procediemiento"
          onPress={() => navigation.navigate('Informacion')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="mic-outline"
          title="Replicar Voz"
          subtitle="Realice las tareas indicadas para replicar y registrar su voz"
          onPress={() => navigation.navigate('Replicacion')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="list-outline"
          title="Voces Replicadas"
          subtitle="Administre las voces que ya están replicadas"
          onPress={() => navigation.navigate('VocesRegistradas')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
});
