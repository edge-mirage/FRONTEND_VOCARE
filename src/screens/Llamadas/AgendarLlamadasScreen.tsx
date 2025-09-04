// src/screens/Llamadas/AgendarLlamadasScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Pressable, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import Header from '@/components/Header';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import { colors, spacing } from '@/theme';
import type { ScheduledCall } from '@/domain/schedule/types';
import type { LlamadaStackParamList } from '@/navigation/types';
import { useGroupUuid } from '@/hooks/useGroupUuid';

import {
  listSchedulesByGroup, createSchedule, updateSchedule, deleteSchedule,
  apiToUI, uiToApiCreate, uiToApiPatch,
} from '@/crud/schedule';

type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'AgendarLlamada'>;

export default function AgendarLlamadasScreen() {
  const navigation = useNavigation<Nav>();
  const { groupUuid, loadingGroup } = useGroupUuid();

  const [items, setItems] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!groupUuid) return; // aún sin uuid
    try {
      setLoading(true);
      const rows = await listSchedulesByGroup(groupUuid);
      setItems(rows.map(apiToUI));
    } catch (e: any) {
      console.warn('Error listSchedulesByGroup', e?.message || e);
      Alert.alert('Error', 'No se pudieron cargar las llamadas.');
    } finally {
      setLoading(false);
    }
  }, [groupUuid]);

  useEffect(() => { load(); }, [load]);

  // ---- acciones ----
  const add = async (payload: Omit<ScheduledCall, 'id'>) => {
    if (!groupUuid) return;
    try {
      const created = await createSchedule(uiToApiCreate(payload, groupUuid));
      setItems(prev => [apiToUI(created), ...prev]);
    } catch {
      Alert.alert('Error', 'No se pudo crear la llamada.');
    }
  };

  const update = async (id: string, payload: Omit<ScheduledCall, 'id'>) => {
    try {
      const updated = await updateSchedule(Number(id), uiToApiPatch(payload));
      setItems(prev => prev.map(i => (i.id === id ? apiToUI(updated) : i)));
    } catch {
      Alert.alert('Error', 'No se pudo actualizar la llamada.');
    }
  };

  const toggle = async (id: string, on: boolean) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, active: on } : i)));
    try {
      const updated = await updateSchedule(Number(id), { active: on });
      setItems(prev => prev.map(i => (i.id === id ? apiToUI(updated as any) : i)));
    } catch {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, active: !on } : i)));
      Alert.alert('Error', 'No se pudo cambiar el estado de la llamada.');
    }
  };

  const del = async (id: string) => {
    try {
      await deleteSchedule(Number(id));
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {
      Alert.alert('Error', 'No se pudo eliminar la llamada.');
    }
  };

  const openNew = () => {
    navigation.navigate('LlamadaEditor', {
      onSubmit: (payload: Omit<ScheduledCall, 'id'>) => add(payload),
    });
  };

  const openEdit = (item: ScheduledCall) => {
    navigation.navigate('LlamadaEditor', {
      initial: item,
      onSubmit: (payload: Omit<ScheduledCall, 'id'>) => update(item.id, payload),
    });
  };

  const stillLoading = loadingGroup || loading;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Llamadas Agendadas" elevated />

      {stillLoading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
      )}

      <Pressable onPress={openNew} style={styles.fab} android_ripple={{ color: 'rgba(255,255,255,0.25)' }}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', right: spacing.xl, bottom: spacing.xl,
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTitle: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  emptySubtitle: { color: colors.textMuted },
});
