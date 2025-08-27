import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/theme';
import ScheduleCard from '@/components/ScheduleCard';
import ScheduleSheet from '@/components/ScheduleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSheet } from '@/hooks/useSheet';
import { LlamadaAgendada } from '@/models/agendar_llamada';
import { getAuthToken } from '@/services/auth';

const API_BASE_URL = 'http://192.168.1.5:8000/agendar-llamadas';

export default function AgendarLlamadasScreen() {
  const navigation = useNavigation();
  const { isVisible, openSheet, closeSheet } = useSheet();
  const [scheduledCalls, setScheduledCalls] = useState<LlamadaAgendada[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<LlamadaAgendada | null>(null);

  const fetchScheduledCalls = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar llamadas');
      const data = await response.json();
      setScheduledCalls(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar las llamadas agendadas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledCalls();
  }, []);

  const handleSave = async (payload: any) => {
    try {
      const token = await getAuthToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      let response;
      if (selectedCall) {
        response = await fetch(`${API_BASE_URL}/${selectedCall.id}`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en la solicitud');
      }

      fetchScheduledCalls();
      closeSheet();
    } catch (error) {
      console.error('Error al guardar la llamada:', error);
      Alert.alert('Error', `No se pudo guardar la llamada: ${error.message}`);
    }
  };

  const handleToggle = async (callId: string, isActive: boolean) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE_URL}/${callId}/toggle`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ activo: isActive }),
      });
      
      if (!response.ok) throw new Error('Error al cambiar estado');
      fetchScheduledCalls();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cambiar el estado de la llamada');
    }
  };

  const handleDelete = async (callId: string) => {
    try {
      Alert.alert(
        'Confirmar eliminación',
        '¿Estás seguro de que quieres eliminar esta llamada agendada?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              const token = await getAuthToken();
              const response = await fetch(`${API_BASE_URL}/${callId}`, {
                method: 'DELETE',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (!response.ok) throw new Error('Error al eliminar');
              fetchScheduledCalls();
            }
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo eliminar la llamada');
    }
  };

  const handleEdit = (call: LlamadaAgendada) => {
    setSelectedCall(call);
    openSheet();
  };

  const handleCloseSheet = () => {
    setSelectedCall(null);
    closeSheet();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Llamadas Agendadas</Text>
        </View>

        {/* Lista de llamadas */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : scheduledCalls.length > 0 ? (
          <FlatList
            data={scheduledCalls}
            renderItem={({ item }) => (
              <ScheduleCard
                call={item}
                onToggle={(isActive) => handleToggle(item.id, isActive)}
                onDelete={() => handleDelete(item.id)}
                onPress={() => handleEdit(item)}
              />
            )}
            keyExtractor={item => item.id}
            refreshing={loading}
            onRefresh={fetchScheduledCalls}
          />
        ) : (
          <View style={styles.noCallsContainer}>
            <Text style={styles.noCallsText}>
              No tienes llamadas agendadas. ¡Crea una!
            </Text>
          </View>
        )}

        {/* Botón flotante para agregar */}
        <Pressable style={styles.addButton} onPress={openSheet}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>

        {/* Hoja inferior para agregar/editar */}
        <ScheduleSheet 
          isVisible={isVisible} 
          onClose={handleCloseSheet} 
          onSave={handleSave} 
          initial={selectedCall}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.sm },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  noCallsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCallsText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
