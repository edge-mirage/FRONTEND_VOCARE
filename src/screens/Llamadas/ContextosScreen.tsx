// src/screens/Llamadas/ContextosScreen.tsx       
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Pressable, Modal, TextInput, Button, StyleSheet, RefreshControl
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { obtenerContextoPorGrupo, crearContextItem, actualizarContextItem, eliminarContextItem } from '@/crud/family';
import { StorageService } from '@/services/StorageService';

interface ContextItem {
  id: number;
  title: string;
  description: string;
}

export default function ContextosScreen() {
  const [items, setItems] = useState<ContextItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [contextId, setContextId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ContextItem | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ContextItem | null>(null);
  const [grupoUuid, setGrupoUuid] = useState<string | null>(null);

  // Cargar grupo_uuid desde storage al inicializar
  useEffect(() => {
    const loadGrupoUuid = async () => {
      const uuid = await StorageService.getGroupUuid();
      setGrupoUuid(uuid);
    };
    loadGrupoUuid();
  }, []);

  const fetchContextos = useCallback(async () => {
    if (!grupoUuid) return;
    
    try {
      setLoading(true);
      const contexto = await obtenerContextoPorGrupo(grupoUuid);
      setItems(contexto.items || []);
      setContextId(contexto.id || null); // Store the context_id for creating new items
    } catch (error) {
      console.error('Error al cargar contextos:', error);
    } finally {
      setLoading(false);
    }
  }, [grupoUuid]);

  const handleCreateContext = async () => {
    try {
      if (editingItem) {
        // Update existing item
        const contextData = {
          family_group_context_id: contextId,
          title: draftTitle,
          description: draftDescription,
        };

        await actualizarContextItem(editingItem.id, contextData);
      } else {
        // Create new item
        if (!contextId) {
          console.error('No context ID available');
          return;
        }

        const contextData = {
          family_group_context_id: contextId,
          title: draftTitle,
          description: draftDescription,
        };

        await crearContextItem(contextData);
      }

      setModalVisible(false);
      setDraftTitle('');
      setDraftDescription('');
      setEditingItem(null);
      fetchContextos(); // recarga los datos
    } catch (e) {
      console.error('Error guardando contexto:', e);
    }
  };

  const handleEditContext = (item: ContextItem) => {
    setEditingItem(item);
    setDraftTitle(item.title);
    setDraftDescription(item.description);
    setModalVisible(true);
  };

  const handleDeleteContext = (item: ContextItem) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteContext = async () => {
    try {
      if (itemToDelete) {
        await eliminarContextItem(itemToDelete.id);
        setDeleteModalVisible(false);
        setItemToDelete(null);
        fetchContextos(); // recarga los datos
      }
    } catch (e) {
      console.error('Error eliminando contexto:', e);
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const resetModal = () => {
    setModalVisible(false);
    setDraftTitle('');
    setDraftDescription('');
    setEditingItem(null);
  };

  useEffect(() => { 
    if (grupoUuid) {
      fetchContextos();
    }
  }, [fetchContextos, grupoUuid]);

  return (
    <View style={styles.container}>
      <Header title="Contextos de Llamada" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contextItem}
            onPress={() => handleEditContext(item)}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
          >
            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>{item.title}</Text>
              <Text style={styles.contextDescription}>{item.description}</Text>
            </View>
            <View style={styles.actionButtons}>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditContext(item);
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteContext(item);
                }}
                android_ripple={{ color: 'rgba(255,0,0,0.1)', radius: 20 }}
              >
                <Ionicons name="trash" size={18} color="#e74c3c" />
              </Pressable>
            </View>
          </Pressable>
        )}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchContextos} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay contextos disponibles.</Text>
          </View>
        ) : null}
      />

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
              {editingItem ? 'Editar Contexto' : 'Nuevo Contexto'}
            </Text>

            <TextInput
              placeholder="Título"
              value={draftTitle}
              onChangeText={setDraftTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Descripción"
              value={draftDescription}
              onChangeText={setDraftDescription}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="#888" onPress={resetModal} />
              <Button title={editingItem ? 'Actualizar' : 'Guardar'} onPress={handleCreateContext} />
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
              ¿Estás seguro de que deseas eliminar "{itemToDelete?.title}"?
            </Text>
            <Text style={styles.confirmSubtitle}>Esta acción no se puede deshacer.</Text>
            
            <View style={styles.confirmButtons}>
              <Button title="Cancelar" color="#888" onPress={cancelDelete} />
              <Button title="Eliminar" color="#e74c3c" onPress={confirmDeleteContext} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.card 
  },
  listContent: { 
    paddingBottom: spacing.xl,
    padding: spacing.xl 
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.text,         
    fontSize: 16,
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
