// src/screens/Paciente/InteresesScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Pressable,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { PlainItem } from '@/components/plain';

type Interes = {
  id: string;
  nombre: string;
  descripcion?: string;
};

// MOCK inicial (luego cambias por la data del backend)
const MOCK: Interes[] = [
  { id: '1', nombre: 'Interés 1', descripcion: 'Descripcion 1' },
  { id: '2', nombre: 'Interés 2', descripcion: 'Descripcion 2' },
  { id: '3', nombre: 'Interés 3', descripcion: 'Descripcion 3' },
  { id: '4', nombre: 'Interés 4', descripcion: 'Descripcion 4' },
];

export default function InteresesScreen() {
  const [items, setItems] = useState<Interes[]>([]);
  const [loading, setLoading] = useState(false);

  // Simula carga desde API
  const fetchIntereses = useCallback(async () => {
    setLoading(true);
    // const resp = await api.get<Interes[]>('/paciente/:id/intereses'); o algo asi noseeeee -- hay que ver
    // setItems(resp.data);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
    setItems(MOCK);
    setLoading(false);
  }, []);

  useEffect(() => { fetchIntereses(); }, [fetchIntereses]);

  return (
    <View style={styles.container}>
      <Header title="Intereses" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <PlainItem
            title={item.nombre}
            subtitle={item.descripcion}
            onPress={() => {
              // TODO: navegar a detalle/edición: navigation.navigate('SintomaDetalle', { id: item.id })
            }}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchIntereses} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? <View style={styles.empty} /> : null}
      />

      <Pressable
        style={styles.fab}
        onPress={() => {
          // TODO: navegar a crear interés: navigation.navigate('NuevoInteres')
        }}
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  listContent: { paddingBottom: spacing.xl },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.xl,          // alinea con los textos
    marginRight: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 4,                    // sombra Android
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, // iOS
  },
  empty: { height: spacing.xl },
});
