// src/screens/Llamadas/AgendarLlamadasScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import Header from '@/components/Header';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { colors, spacing } from '@/theme';
import type { ScheduledCall } from '@/domain/schedule/types';
import type { LlamadaStackParamList } from '@/navigation/types';

// ---- Mock inicial (sustituir por datos del backend) ----
const now = new Date();
const at = (h: number, m: number) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const MOCK: ScheduledCall[] = [
  {
    id: 'a1',
    timeISO: at(17, 30), // 05:30 p.m.
    repeat: { type: 'weekly', days: [1, 2, 3, 4, 5] }, // L-M-X-J-V
    note: 'Conversación rutinaria y casual',
    durationMin: 15,
    voiceId: 'v1',
    active: true,
  },
  {
    id: 'b2',
    timeISO: at(14, 30), // 02:30 p.m.
    repeat: { type: 'oneoff', dateISO: '2025-08-21' },
    note: 'Preguntar por actividades de la semana',
    durationMin: 10,
    voiceId: 'v2',
    active: true,
  },
];

type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'AgendarLlamada'>;

export default function AgendarLlamadasScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<ScheduledCall[]>(MOCK);

  const add = (payload: Omit<ScheduledCall, 'id'>) => {
    setItems(prev => [{ id: Math.random().toString(36).slice(2), ...payload }, ...prev]);
  };

  const update = (id: string, payload: Omit<ScheduledCall, 'id'>) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...payload } : i)));
  };

  const toggle = (id: string, on: boolean) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, active: on } : i)));
  };

  const del = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const openNew = () => {
    navigation.navigate('LlamadaEditor', {
      onSubmit: (payload) => add(payload),
    });
  };

  const openEdit = (item: ScheduledCall) => {
    navigation.navigate('LlamadaEditor', {
      initial: item,
      onSubmit: (payload) => update(item.id, payload),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Llamadas Agendadas" elevated />

      <FlatList
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.xxl * 2 }}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ScheduleCard
            item={item}
            onPress={() => openEdit(item)}
            onToggle={(v) => toggle(item.id, v)}
            onDelete={() => del(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No hay llamadas agendadas</Text>
            <Text style={styles.emptySubtitle}>Toca el botón “+” para crear una nueva.</Text>
          </View>
        }
      />

      {/* FAB para crear */}
      <Pressable
        onPress={openNew}
        style={styles.fab}
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  emptySubtitle: { color: colors.textMuted },
});
