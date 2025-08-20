// src/screens/Llamadas/AgendarLlamadasScreen.tsx
import React, { useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { ScheduledCall } from '@/domain/schedule/types';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import ScheduleSheet from '@/components/schedule/ScheduleSheet';

export default function AgendarLlamadasScreen() {
  const [items, setItems] = useState<ScheduledCall[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ScheduledCall | null>(null);

  const openNew = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (it: ScheduledCall) => { setEditing(it); setSheetOpen(true); };

  function add(payload: Omit<ScheduledCall,'id'>) {
    setItems(prev => [{ id: Math.random().toString(36).slice(2), ...payload }, ...prev]);
  }
  function update(id: string, payload: Omit<ScheduledCall,'id'>) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...payload } : i)));
  }
  function toggle(id: string, on: boolean) {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, active: on } : i)));
  }
  function del(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Llamadas Agendadas" elevated />

      <FlatList
        contentContainerStyle={{ padding: spacing.xl }}
        data={items}
        keyExtractor={i=>i.id}
        renderItem={({item})=>(
          <ScheduleCard
            item={item}
            onPress={() => openEdit(item)}          // ← ABRE EN MODO EDICIÓN
            onToggle={(v) => toggle(item.id, v)}
            onDelete={() => del(item.id)}
          />
        )}
      />

      {/* FAB nuevo */}
      <Pressable onPress={openNew} style={styles.fab} android_ripple={{color:'rgba(255,255,255,0.25)'}}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* Sheet crear/editar */}
      {sheetOpen && (
        <ScheduleSheet
          initial={editing ?? undefined}           // ← PASA LOS DATOS AL SHEET
          onClose={() => { setSheetOpen(false); setEditing(null); }}
          onSave={(payload) => {
            if (editing) update(editing.id, payload);  // ← ACTUALIZA
            else add(payload);                         // ← CREA
            setSheetOpen(false);
            setEditing(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position:'absolute', right: spacing.xl, bottom: spacing.xl,
    width: 52, height: 52, borderRadius: 26, alignItems:'center', justifyContent:'center',
    backgroundColor: colors.primary, elevation: 4,
  },
});
