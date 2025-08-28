import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Pressable, Modal, TextInput, Button, Text,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { PlainItem } from '@/components/plain';
import { getPacientById, addSymptom, updateSymptom, deleteSymptom } from '@/crud/pacient';
import { StorageService } from '@/services/StorageService';

type Sintoma = {
  id: string;
  nombre: string;
  descripcion?: string;
};

export default function SintomasScreen() {
  const [items, setItems] = useState<Sintoma[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftNombre, setDraftNombre] = useState('');
  const [draftDescripcion, setDraftDescripcion] = useState('');
  const [editingItem, setEditingItem] = useState<Sintoma | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Sintoma | null>(null);
  const [pacientId, setPacientId] = useState<number | null>(null);

  // Cargar pacient_id desde storage al inicializar
  useEffect(() => {
    const loadPacientId = async () => {
      const id = await StorageService.getPacientId();
      setPacientId(id);
    };
    loadPacientId();
  }, []);

  const fetchSintomas = useCallback(async () => {
    if (!pacientId) return;
    
    setLoading(true);
    try {
      const resp = await getPacientById(pacientId);
      const raw = resp.data.symptoms || [];
      const mapped = raw.map((it: any, idx: number) => ({
        id: idx.toString(),
        nombre: it.name || 'Síntoma',
        descripcion: it.description || '',
      }));
      setItems(mapped);
    } catch (err) {
      console.error('Error al obtener síntomas:', err);
    } finally {
      setLoading(false);
    }
  }, [pacientId]);

  const handleCreateSintoma = async () => {
    if (!pacientId) return;
    
    try {
      if (editingItem) {
        // Update existing item
        const sintomaData = {
          name: draftNombre,
          description: draftDescripcion,
        };
        await updateSymptom(pacientId, parseInt(editingItem.id), sintomaData);
      } else {
        // Create new item
        const sintomaData = {
          name: draftNombre,
          description: draftDescripcion,
        };
        await addSymptom(pacientId, sintomaData);
      }

      resetModal();
      fetchSintomas();
    } catch (e) {
      console.error('Error guardando síntoma:', e);
    }
  };

  const handleEditSintoma = (item: Sintoma) => {
    setEditingItem(item);
    setDraftNombre(item.nombre);
    setDraftDescripcion(item.descripcion || '');
    setModalVisible(true);
  };

  const handleDeleteSintoma = (item: Sintoma) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteSintoma = async () => {
    if (!pacientId) return;
    
    try {
      if (itemToDelete) {
        await deleteSymptom(pacientId, parseInt(itemToDelete.id));
        setDeleteModalVisible(false);
        setItemToDelete(null);
        fetchSintomas();
      }
    } catch (e) {
      console.error('Error eliminando síntoma:', e);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const resetModal = () => {
    setModalVisible(false);
    setDraftNombre('');
    setDraftDescripcion('');
    setEditingItem(null);
  };

  useEffect(() => { 
    if (pacientId) {
      fetchSintomas();
    }
  }, [fetchSintomas, pacientId]);

  return (
    <View style={styles.container}>
      <Header title="Síntomas" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contextItem}
            onPress={() => handleEditSintoma(item)}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
          >
            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>{item.nombre}</Text>
              <Text style={styles.contextDescription}>{item.descripcion}</Text>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditSintoma(item);
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteSintoma(item);
                }}
                android_ripple={{ color: 'rgba(255,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="trash" size={18} color="#e74c3c" />
              </Pressable>
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSintomas} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? <View style={styles.empty} /> : null}
      />
      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Síntoma' : 'Nuevo Síntoma'}
            </Text>

            <TextInput
              placeholder="Nombre"
              value={draftNombre}
              onChangeText={setDraftNombre}
              style={styles.input}
            />

            <TextInput
              placeholder="Descripción"
              value={draftDescripcion}
              onChangeText={setDraftDescripcion}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="#888" onPress={resetModal} />
              <Button title={editingItem ? 'Actualizar' : 'Guardar'} onPress={handleCreateSintoma} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContainer}>
            <Text style={styles.confirmTitle}>Confirmar eliminación</Text>
            <Text style={styles.confirmMessage}>
              ¿Estás seguro de que deseas eliminar "{itemToDelete?.nombre}"?
            </Text>
            <Text style={styles.confirmSubtitle}>Esta acción no se puede deshacer.</Text>
            
            <View style={styles.confirmButtons}>
              <Button title="Cancelar" color="#888" onPress={cancelDelete} />
              <Button title="Eliminar" color="#e74c3c" onPress={confirmDeleteSintoma} />
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
    marginHorizontal: spacing.xl,
  },
  contextItem: {
    backgroundColor: colors.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  empty: { height: spacing.xl },
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
