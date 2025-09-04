// src/screens/Replicaciones/ReplicacionesHomeScreen.tsx
import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native'; // ← añade
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import { colors, spacing } from '@/theme';
import { ReplicacionStackParamList } from '@/navigation/types';
import CardRowProgress from '@/components/CardRowProgress';
import { useTasksCompleted } from '@/hooks/useTasksCompleted';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList>;

export default function ReplicacionesHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { doneCount, total, loading, reload } = useTasksCompleted();

  // Opción A: recargar cada vez que la pantalla toma foco
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  // (Opcional) Opción B equivalente con useIsFocused
  // const isFocused = useIsFocused();
  // useEffect(() => { if (isFocused) reload(); }, [isFocused, reload]);

  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header title="Replicación de Voz" onInfoPress={() => {}} />
      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          icon="information-outline"
          title="Información"
          subtitle="Revise toda la información respecto del procediemiento"
          onPress={() => navigation.navigate('Informacion')}
        />
        <View style={{ height: spacing.lg }} />
        <CardRowProgress
          icon="mic-outline"
          title="Replicar mi voz"
          subtitle={loading ? 'Cargando progreso…' : `Progreso: ${doneCount}/${total} tareas`}
          progress={progress}
          onPress={() => navigation.navigate('Replicacion')}
        />
        <View style={{ height: spacing.lg }} />
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
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
});
