// src/screens/Replicaciones/ReplicacionesHomeScreen.tsx
import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {ReplicacionStackParamList} from '@/navigation/types';
import CardRowProgress from '@/components/CardRowProgress';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList>;

export default function ReplicacionesHomeScreen() {
  const navigation = useNavigation<Nav>();

  const MOCK_REPLICATION_PROGRESS = 25;


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
        <CardRowProgress
          icon="mic-outline"
          title="Replicar mi voz"
          subtitle="Realice las tareas indicadas para replicar y registrar su voz"
          progress={MOCK_REPLICATION_PROGRESS}
          onPress={() => navigation.navigate('Replicacion')} // ajusta a tu ruta de tareas
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
