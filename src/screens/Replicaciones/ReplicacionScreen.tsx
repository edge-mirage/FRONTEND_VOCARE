// src//screens/Replicaciones/ReplicacionScreen.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/Header';
import TaskRow from '@/components/TaskRow';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';
import { useTasksCompleted } from '@/hooks/useTasksCompleted';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'Replicacion'>;

export default function ReplicacionScreen() {
  const navigation = useNavigation<Nav>();
  const { tasks: doneFlags, loading, reload } = useTasksCompleted();

  // Recargar al enfocar
  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, [reload])
  );

  const tasks = React.useMemo(
    () => Array.from({ length: 9 }).map((_, i) => ({
      index: i + 1,
      title: `Tarea de Lectura ${i + 1}`,
      subtitle: 'Grabar audio leyendo el texto que se te presenta',
      done: Boolean(doneFlags[i]),
    })),
    [doneFlags]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Replicación de Voz" onInfoPress={() => navigation.navigate('Informacion')} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: spacing.lg, color: colors.text }}>
          Tareas de replicación
        </Text>
        <View style={{ gap: spacing.md }}>
          {tasks.map(t => (
            <TaskRow
              key={t.index}
              title={t.title}
              subtitle={t.subtitle}
              done={t.done}
              onPress={() => navigation.navigate('TareaLectura', { taskIndex: t.index })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}