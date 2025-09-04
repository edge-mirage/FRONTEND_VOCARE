import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/Header';
import TaskRow from '@/components/TaskRow';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'Replicacion'>;

// MOCK: 0 = pendiente, 1 = hecha (en el mock, la #2 está hecha)
const TASKS_DONE_MOCK = [0, 1, 0, 0, 0, 0, 0, 0, 0] as const;

export default function ReplicacionScreen() {
  const navigation = useNavigation<Nav>();

  const tasks = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        index: i + 1,
        title: `Tarea de Lectura ${i + 1}`,
        subtitle: 'Grabar audio leyendo el texto que se te presenta',
        done: Boolean(TASKS_DONE_MOCK[i] ?? 0),
      })),
    []
  );

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

