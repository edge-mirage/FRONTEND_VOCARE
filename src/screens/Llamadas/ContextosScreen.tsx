// src/screens/Llamadas/ContextosScreen.tsx       
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Pressable, Modal, TextInput, Button, StyleSheet, RefreshControl, Alert, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { obtenerContextoPorGrupo, crearContextItem, actualizarContextItem, eliminarContextItem } from '@/crud/family';
import { StorageService } from '@/services/StorageService';
import NetInfo from '@react-native-community/netinfo';

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

  const checkInternetConnection = async (): Promise<boolean> => {
    const netInfoState = await NetInfo.fetch();
    return netInfoState.isConnected ?? false;
  };

  const fetchContextos = useCallback(async () => {
    if (!grupoUuid) return;
    
    // ✅ Verificar conexión
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      Alert.alert(
        '❌ Sin Conexión', 
        'Debes estar conectado a internet para cargar los contextos.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    
    try {
      setLoading(true);
      const contexto = await obtenerContextoPorGrupo(grupoUuid);
      setItems(contexto.items || []);
      setContextId(contexto.id || null);
    } catch (error) {
      console.error('Error al cargar contextos:', error);
      // ✅ Mensaje de error mejorado
      Alert.alert(
        '⚠️ Error de Conexión',
        'No se pudieron cargar los contextos. Verifica tu conexión e intenta más tarde.',
        [{ text: 'Reintentar', onPress: fetchContextos }, { text: 'Cancelar' }]
      );
    } finally {
      setLoading(false);
    }
  }, [grupoUuid]);

  const handleCreateContext = async () => {
    // ✅ Verificar conexión
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      Alert.alert(
        '❌ Sin Conexión', 
        'Debes estar conectado a internet para guardar contextos.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    // ✅ Validar campos obligatorios
    if (!draftTitle.trim() || !draftDescription.trim()) {
      Alert.alert('⚠️ Campos Incompletos', 'Por favor completa el título y la descripción del contexto.');
      return;
    }

    // ✅ VALIDAR SEGÚN LAS REGLAS DE PYDANTIC
    const title = draftTitle.trim();
    const description = draftDescription.trim();
    
    if (title.length < 2) {
      Alert.alert('❌ Título muy corto', 'El título debe tener al menos 2 caracteres.');
      return;
    }
    if (title.length > 200) {
      Alert.alert('❌ Título muy largo', 'El título debe tener máximo 200 caracteres.');
      return;
    }
    if (description.length < 5) {
      Alert.alert('❌ Descripción muy corta', 'La descripción debe tener al menos 5 caracteres.');
      return;
    }

    if (!contextId || typeof contextId !== 'number') {
      Alert.alert('Error', 'No se pudo identificar el grupo familiar. Recarga la pantalla.');
      return;
    }

    try {
      const contextData = {
        family_group_context_id: contextId,
        title: title,
        description: description,
      };

      if (editingItem) {
        await actualizarContextItem(editingItem.id, contextData);
      } else {
        await crearContextItem(contextData);
      }

      setModalVisible(false);
      setDraftTitle('');
      setDraftDescription('');
      setEditingItem(null);
      fetchContextos();
      
      // ✅ Mensaje de éxito
      if (!editingItem) {
        Alert.alert(
          '🎉 Contexto Creado',
          'El nuevo contexto ha sido guardado exitosamente.',
          [{ text: 'Perfecto' }]
        );
      }
      
    } catch (e: any) {
      // ✅ MANEJAR ERROR ESPECÍFICO DE LÍMITE DE 15
      if (e.response?.status === 400 && e.response?.data?.detail) {
        const errorDetail = e.response.data.detail;
        
        // ✅ Si es un objeto con información del límite
        if (typeof errorDetail === 'object' && errorDetail.error === 'limite_maximo_alcanzado') {
          Alert.alert(
            '🚫 Límite Alcanzado',
            `${errorDetail.message}\n\nActualmente tienes ${errorDetail.cantidad_actual} contextos de ${errorDetail.limite_maximo} permitidos.`,
            [
              { text: 'Entendido', style: 'default' },
              { 
                text: 'Ver Contextos', 
                onPress: () => {
                  setModalVisible(false);
                }
              }
            ]
          );
          return;
        }
        // ✅ Si es un string que menciona el límite
        else if (typeof errorDetail === 'string' && errorDetail.includes('límite')) {
          Alert.alert(
            '🚫 Límite de Contextos Alcanzado',
            'Has alcanzado el máximo de 15 contextos personalizados. Elimina algunos contextos existentes para crear uno nuevo.',
            [
              { text: 'Entendido', style: 'default' },
              { 
                text: 'Ver Contextos', 
                onPress: () => {
                  setModalVisible(false);
                }
              }
            ]
          );
          return;
        }
      }
      
      // ✅ Otros errores generales
      Alert.alert(
        '⚠️ Error',
        'No se pudo guardar el contexto. Verifica tu conexión e intenta más tarde.',
        [{ text: 'Reintentar', onPress: handleCreateContext }, { text: 'Cancelar' }]
      );
    }
  };

  const handleEditContext = (item: ContextItem) => {
    console.log('🔧 Editando contexto:', item.title);
    setEditingItem(item);
    setDraftTitle(item.title);
    setDraftDescription(item.description);
    setModalVisible(true);
  };

  const handleDeleteContext = (item: ContextItem) => {
    console.log('🗑️ Preparando eliminación de:', item.title);
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDeleteContext = async () => {
    // ✅ Verificar conexión
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      Alert.alert(
        '❌ Sin Conexión', 
        'Debes estar conectado a internet para eliminar contextos.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    try {
      if (itemToDelete) {
        await eliminarContextItem(itemToDelete.id);
        setDeleteModalVisible(false);
        setItemToDelete(null);
        fetchContextos();
      }
    } catch (e) {
      console.error('Error eliminando contexto:', e);
      // ✅ Mensaje de error mejorado
      Alert.alert(
        '⚠️ Error',
        'No se pudo eliminar el contexto. Verifica tu conexión e intenta más tarde.',
        [{ text: 'Reintentar', onPress: confirmDeleteContext }, { text: 'Cancelar' }]
      );
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  // Modificar la función resetModal para asegurar limpieza completa:
  const resetModal = () => {
    setModalVisible(false);
    // ✅ Usar setTimeout para asegurar limpieza después de cerrar modal
    setTimeout(() => {
      setDraftTitle('');
      setDraftDescription('');
      setEditingItem(null);
    }, 100);
  };

  // ✅ También limpiar al abrir modal para crear (no editar):
  const openCreateModal = () => {
    console.log('➕ Abriendo modal para crear nuevo contexto');
    setDraftTitle('');        // ✅ Limpiar antes de abrir
    setDraftDescription('');  // ✅ Limpiar antes de abrir
    setEditingItem(null);     // ✅ Asegurar que no está editando
    setModalVisible(true);
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
          <View style={styles.contextItem}>
            {/* ✅ CONTENIDO PRINCIPAL SIN PRESSABLE PADRE */}
            <View style={styles.contextContent}>
              <Text style={styles.contextTitle}>{item.title}</Text>
              <Text style={styles.contextDescription}>{item.description}</Text>
            </View>
            
            {/* ✅ BOTONES DE ACCIÓN CON TOUCHABLEOPACITY */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  console.log('🔧 Botón editar presionado para:', item.title);
                  handleEditContext(item);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  console.log('🗑️ Botón eliminar presionado para:', item.title);
                  handleDeleteContext(item);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          console.log('➕ Botón FAB presionado');
          openCreateModal();
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

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

            <View style={styles.textInputContainer}>
              {draftDescription === '' && (
                <Text style={styles.customPlaceholder}>
                  Tiene diabetes hace 5 años, hipertensión y asma. Vive con su esposa y dos hijos.
                </Text>
              )}
              <TextInput
                value={draftDescription}
                onChangeText={setDraftDescription}
                style={[styles.input, styles.descriptionInput]}
                multiline
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.modalButtons}>
              <Button 
                title="Cancelar" 
                color="#888" 
                onPress={() => {
                  console.log('❌ Botón Cancelar presionado');
                  resetModal();
                }} 
              />
              <Button 
                title={editingItem ? 'Actualizar' : 'Guardar'} 
                onPress={() => {
                  console.log('💾 Botón Guardar/Actualizar presionado');
                  handleCreateContext();
                }} 
              />
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
              <Button 
                title="Cancelar" 
                color="#888" 
                onPress={() => {
                  console.log('❌ Cancelar eliminación');
                  cancelDelete();
                }} 
              />
              <Button 
                title="Eliminar" 
                color="#e74c3c" 
                onPress={() => {
                  console.log('🗑️ Confirmar eliminación');
                  confirmDeleteContext();
                }} 
              />
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
  textInputContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  customPlaceholder: {
    position: 'absolute',
    top: spacing.sm + 1, // Ajustar según el border del input
    left: spacing.sm + 1,
    right: spacing.sm + 1,
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    zIndex: 1,
    pointerEvents: 'none', // Permite tocar el TextInput debajo
    paddingTop: spacing.sm, // Mismo padding que el TextInput
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
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