import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Pressable, Modal, TextInput, Button, Text, Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { 
  getCurrentPacient,  // ✅ Usar esta función
  addEventByGroup,    // ✅ Funciones de eventos, no síntomas
  updateEventByGroup, 
  deleteEventByGroup 
} from '@/crud/pacient';

type Evento = {
  id: string;
  tipo: string;    // ✅ Eventos usan 'tipo' y 'fecha'
  fecha?: string;
};

export default function EventosScreen() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftTipo, setDraftTipo] = useState('');
  const [draftFecha, setDraftFecha] = useState('');
  const [editingItem, setEditingItem] = useState<Evento | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Evento | null>(null);

  const fetchEventos = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 Obteniendo eventos...');
      const resp = await getCurrentPacient();
      
      if (resp.data) {
        const raw = resp.data.events || [];
        const mapped = raw.map((it: any, idx: number) => ({
          id: idx.toString(),
          tipo: it.type || it.tipo || 'Evento',
          fecha: it.date || it.fecha || '',
        }));
        setItems(mapped);
        console.log('✅ Eventos cargados:', mapped.length);
      }
    } catch (err) {
      console.error('❌ Error al obtener eventos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateEvento = async () => {
    if (!draftTipo.trim()) {
      Alert.alert('Error', 'El tipo de evento es requerido');
      return;
    }
    
    try {
      console.log('💾 Guardando evento:', { tipo: draftTipo, fecha: draftFecha });
      
      if (editingItem) {
        const eventoData = {
          type: draftTipo.trim(),
          tipo: draftTipo.trim(),
          date: draftFecha.trim(),
          fecha: draftFecha.trim(),
        };
        await updateEventByGroup(parseInt(editingItem.id), eventoData);
        console.log('✅ Evento actualizado');
        Alert.alert('Éxito', 'Evento actualizado correctamente');
      } else {
        const eventoData = {
          type: draftTipo.trim(),
          tipo: draftTipo.trim(),
          date: draftFecha.trim(),
          fecha: draftFecha.trim(),
        };
        await addEventByGroup(eventoData);
        console.log('✅ Evento creado');
        Alert.alert('Éxito', 'Evento creado correctamente');
      }

      resetModal();
      fetchEventos();
    } catch (e: any) {
      console.error('❌ Error guardando evento:', e);
      Alert.alert('Error', 'No se pudo guardar el evento');
    }
  };

  const handleEditEvento = (item: Evento) => {
    console.log('📝 Editando evento:', item);
    setEditingItem(item);
    setDraftTipo(item.tipo);
    setDraftFecha(item.fecha || '');
    setModalVisible(true);
  };

  const handleDeleteEvento = (item: Evento) => {
    console.log('🗑️ Solicitando eliminación de:', item);
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteEvento = async () => {
    if (!itemToDelete) return;
    
    try {
      console.log('🗑️ Eliminando evento:', itemToDelete.tipo);
      await deleteEventByGroup(parseInt(itemToDelete.id));
      setDeleteModalVisible(false);
      setItemToDelete(null);
      fetchEventos();
      console.log('✅ Evento eliminado');
      Alert.alert('Éxito', 'Evento eliminado correctamente');
    } catch (e: any) {
      console.error('❌ Error eliminando evento:', e);
      Alert.alert('Error', 'No se pudo eliminar el evento');
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const resetModal = () => {
    setModalVisible(false);
    setDraftTipo('');
    setDraftFecha('');
    setEditingItem(null);
  };

  useEffect(() => {
    console.log('🚀 Iniciando carga de eventos...');
    fetchEventos();
  }, [fetchEventos]);

  return (
    <View style={styles.container}>
      <Header title="Eventos" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contextItem}
            onPress={() => {
              console.log('📋 Item presionado:', item);
              handleEditEvento(item);
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
          >
            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>{item.tipo}</Text>
              <Text style={styles.contextDescription}>{item.fecha}</Text>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log('✏️ Botón editar presionado:', item);
                  handleEditEvento(item);
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  console.log('🗑️ Botón eliminar presionado:', item);
                  handleDeleteEvento(item);
                }}
                android_ripple={{ color: 'rgba(255,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="trash" size={18} color="#e74c3c" />
              </Pressable>
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchEventos} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay eventos registrados</Text>
              <Text style={styles.emptySubtext}>Agrega tu primer evento usando el botón +</Text>
            </View>
          ) : null
        }
      />
      
      <Pressable
        style={styles.fab}
        onPress={() => {
          console.log('➕ Botón agregar presionado');
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={resetModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Evento' : 'Nuevo Evento'}
            </Text>
            <TextInput
              placeholder="Tipo"
              value={draftTipo}
              onChangeText={setDraftTipo}
              style={styles.input}
            />
            <TextInput
              placeholder="Fecha"
              value={draftFecha}
              onChangeText={setDraftFecha}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="#888" onPress={resetModal} />
              <Button title={editingItem ? 'Actualizar' : 'Guardar'} onPress={handleCreateEvento} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={cancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmTitle}>Confirmar eliminación</Text>
            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que deseas eliminar "{itemToDelete?.tipo}"?
            </Text>
            <Text style={styles.confirmSubtitle}>Esta acción no se puede deshacer.</Text>
            <View style={styles.confirmButtons}>
              <Button title="Cancelar" color="#888" onPress={cancelDelete} />
              <Button title="Eliminar" color="#e74c3c" onPress={confirmDeleteEvento} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card },
  listContent: { paddingBottom: spacing.xl },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  contextItem: {
    backgroundColor: '#fff',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
  },
  contextContent: {
    flex: 1,
    paddingRight: spacing.md,
  },
  contextTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  contextDescription: {
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    width: '85%',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 6,
    padding: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmModalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    width: '80%',
    elevation: 10,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: '#e74c3c',
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: spacing.xs,
    color: colors.text,
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
  },
});
