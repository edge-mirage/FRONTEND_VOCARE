import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Pressable, Modal, Text, TextInput, Button,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { PlainItem } from '@/components/plain';
import { getPacientById, addInterest, updateInterest, deleteInterest} from '@/crud/pacient';
import { StorageService } from '@/services/StorageService';

type Interes = {
  id: string;
  nombre: string;
  descripcion?: string;
};

export default function InteresesScreen() {
  const [items, setItems] = useState<Interes[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftNombre, setDraftNombre] = useState('');
  const [draftDescripcion, setDraftDescripcion] = useState('');
  const [editingItem, setEditingItem] = useState<Interes | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Interes | null>(null);
  const [pacientId, setPacientId] = useState<number | null>(null);

  // Cargar pacient_id desde storage al inicializar
  useEffect(() => {
    const loadPacientId = async () => {
      const id = await StorageService.getPacientId();
      setPacientId(id);
    };
    loadPacientId();
  }, []);

  // Simula carga desde API
  const fetchIntereses = useCallback(async () => {
    if (!pacientId) return;
    
    try {
      setLoading(true);
      const resp = await getPacientById(pacientId);
      console.log('Respuesta API:', resp);
      
      const rawInterests = resp.data.interests || [];

      const mapped = rawInterests.map((it: any, index: number) => ({
        id: index.toString(),
        nombre: it.nombre,
        descripcion: it.descripcion || '',
      }));

      setItems(mapped);
      console.log('Intereses mapeados:', mapped);
    } catch (err) {
      console.error('Error al obtener intereses:', err);
  } finally {
    setLoading(false);
  }
}, [pacientId]);


  const handleCreateInteres = async () => {
    if (!pacientId) return;
    
    try {
      if (editingItem) {
        // Update existing item - the API expects a string or object, let's use object format
        const interestObj = {
          nombre: draftNombre,
          descripcion: draftDescripcion,
        };
        await updateInterest(pacientId, parseInt(editingItem.id), JSON.stringify(interestObj));
      } else {
        // Create new item
        const interestObj = {
          nombre: draftNombre,
          descripcion: draftDescripcion,
        };
        await addInterest(pacientId, interestObj);
      }

      resetModal();
      fetchIntereses(); // recarga los datos
    } catch (e) {
      console.error('Error guardando interés:', e);
    }
  };

  const handleEditInteres = (item: Interes) => {
    setEditingItem(item);
    setDraftNombre(item.nombre);
    setDraftDescripcion(item.descripcion || '');
    setModalVisible(true);
  };

  const handleDeleteInteres = (item: Interes) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteInteres = async () => {
    if (!pacientId) return;
    
    try {
      if (itemToDelete) {
        await deleteInterest(pacientId, parseInt(itemToDelete.id));
        setDeleteModalVisible(false);
        setItemToDelete(null);
        fetchIntereses();
      }
    } catch (e) {
      console.error('Error eliminando interés:', e);
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
      fetchIntereses();
    }
  }, [fetchIntereses, pacientId]);

  return (
    <View style={styles.container}>
      <Header title="Intereses" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contextItem}
            onPress={() => handleEditInteres(item)}
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
                  handleEditInteres(item);
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteInteres(item);
                }}
                android_ripple={{ color: 'rgba(255,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="trash" size={18} color="#e74c3c" />
              </Pressable>
            </View>
          </Pressable>
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
      

      <>
  <Pressable
      style={styles.fab}
      onPress={() => setModalVisible(true)}
      android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
    >
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
              {editingItem ? 'Editar Interés' : 'Nuevo Interés'}
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
              <Button title={editingItem ? 'Actualizar' : 'Guardar'} onPress={handleCreateInteres} />
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
              <Button title="Eliminar" color="#e74c3c" onPress={confirmDeleteInteres} />
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    elevation: 4,                    // sombra Android
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, // iOS
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
