import React, { useCallback, useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl, Pressable, Modal, Text, TextInput, Button, Alert,
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { 
  getCurrentPacient,  // ✅ Usar esta función
  addInterestByGroup, 
  updateInterestByGroup, 
  deleteInterestByGroup 
} from '@/crud/pacient';

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

  const fetchIntereses = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Obteniendo intereses...');
      // ✅ Usar getCurrentPacient (no getPacientByGroupUuid)
      const resp = await getCurrentPacient();
      
      if (resp.data) {
        const rawInterests = resp.data.interests || [];
        const mapped = rawInterests.map((it: any, index: number) => ({
          id: index.toString(),
          nombre: it.nombre || it.name || 'Interés',
          descripcion: it.descripcion || it.description || '',
        }));
        setItems(mapped);
        console.log('✅ Intereses cargados:', mapped.length);
      }
    } catch (err) {
      console.error('❌ Error al obtener intereses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateInteres = async () => {
    if (!draftNombre.trim()) {
      Alert.alert('Error', 'El nombre del interés es requerido');
      return;
    }
    
    try {
      console.log('💾 Guardando interés:', { nombre: draftNombre, descripcion: draftDescripcion });
      
      if (editingItem) {
        // ✅ No pasar groupUuid - las funciones *ByGroup lo obtienen internamente
        const interestObj = {
          nombre: draftNombre.trim(),
          name: draftNombre.trim(),
          descripcion: draftDescripcion.trim(),
          description: draftDescripcion.trim(),
        };
        await updateInterestByGroup(parseInt(editingItem.id), interestObj);
        console.log('✅ Interés actualizado');
        Alert.alert('Éxito', 'Interés actualizado correctamente');
      } else {
        // ✅ No pasar groupUuid
        const interestObj = {
          nombre: draftNombre.trim(),
          name: draftNombre.trim(),
          descripcion: draftDescripcion.trim(),
          description: draftDescripcion.trim(),
        };
        await addInterestByGroup(interestObj);
        console.log('✅ Interés creado');
        Alert.alert('Éxito', 'Interés creado correctamente');
      }

      resetModal();
      fetchIntereses();
    } catch (e: any) {
      console.error('❌ Error guardando interés:', e);
      Alert.alert('Error', 'No se pudo guardar el interés');
    }
  };

  const handleEditInteres = (item: Interes) => {
    console.log('📝 Editando interés:', item);
    setEditingItem(item);
    setDraftNombre(item.nombre);
    setDraftDescripcion(item.descripcion || '');
    setModalVisible(true);
  };

  const handleDeleteInteres = (item: Interes) => {
    console.log('🗑️ Solicitando eliminación de:', item);
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteInteres = async () => {
    if (!itemToDelete) return;
    
    try {
      console.log('🗑️ Eliminando interés:', itemToDelete.nombre);
      // ✅ No pasar groupUuid
      await deleteInterestByGroup(parseInt(itemToDelete.id));
      setDeleteModalVisible(false);
      setItemToDelete(null);
      fetchIntereses();
      console.log('✅ Interés eliminado');
      Alert.alert('Éxito', 'Interés eliminado correctamente');
    } catch (e: any) {
      console.error('❌ Error eliminando interés:', e);
      Alert.alert('Error', 'No se pudo eliminar el interés');
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

  // ✅ No depender de groupUuid
  useEffect(() => {
    console.log('🚀 Iniciando carga de intereses...');
    fetchIntereses();
  }, [fetchIntereses]);

  return (
    <View style={styles.container}>
      <Header title="Intereses" />
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contextItem}
            onPress={() => {
              console.log('📋 Item presionado:', item);
              handleEditInteres(item);
            }}
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
                  console.log('✏️ Botón editar presionado:', item);
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
                  console.log('🗑️ Botón eliminar presionado:', item);
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay intereses registrados</Text>
              <Text style={styles.emptySubtext}>Agrega tu primer interés usando el botón +</Text>
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
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </Pressable>

      {/* Modales iguales que antes */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={resetModal}>
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

      <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={cancelDelete}>
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
    </View>
  );
}

// ✅ Usar los estilos corregidos (iguales que SintomasScreen)
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
