import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/theme';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import ScheduleSheet from '@/components/schedule/ScheduleSheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSheet } from '@/hooks/useSheet';
import { ScheduledCall } from '@/domain/schedule/types';
import { getAuthToken } from '@/services/auth';

const API_BASE_URL = 'http://192.168.1.5:8000/agendar-llamadas'; 

export default function AgendarLlamadasScreen() {
  const navigation = useNavigation();
  const { isVisible, openSheet, closeSheet } = useSheet();
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<ScheduledCall | null>(null);

  const fetchScheduledCalls = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al cargar llamadas');
      }
      const data = await response.json();
      setScheduledCalls(data);
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
      Alert.alert('Error', `No se pudieron cargar las llamadas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledCalls();
  }, []);

  const handleOpenEditSheet = (call: ScheduledCall) => {
    setSelectedCall(call);
    openSheet();
  };

  const handleCloseSheet = () => {
    setSelectedCall(null);
    closeSheet();
  };

  const handleSave = async (payload: any) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
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

      await fetchScheduledCalls();
      handleCloseSheet();
    } catch (error) {
      console.error('Error al guardar la llamada:', error);
      Alert.alert('Error', `No se pudo guardar la llamada: ${error.message}`);
    }
  };

  const handleDelete = async (callId: string) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      const response = await fetch(`${API_BASE_URL}/${callId}`, {
        method: 'DELETE',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al eliminar');
      }

      await fetchScheduledCalls();
    } catch (error) {
      console.error('Error al eliminar la llamada:', error);
      Alert.alert('Error', `No se pudo eliminar la llamada: ${error.message}`);
    }
  };

  const handleToggle = async (callId: string, isActive: boolean) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch(`${API_BASE_URL}/${callId}/toggle?activo=${isActive}`, {
        method: 'PUT',
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al alternar estado');
      }

      await fetchScheduledCalls();
    } catch (error) {
      console.error('Error al alternar el estado:', error);
      Alert.alert('Error', `No se pudo alternar el estado: ${error.message}`);
    }
  };

  const renderItem = ({ item }: { item: ScheduledCall }) => (
    <ScheduleCard
      item={item}
      onPress={() => handleOpenEditSheet(item)}
      onToggle={(v) => handleToggle(item.id, v)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Agendar Llamadas</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando llamadas...</Text>
          </View>
        ) : scheduledCalls.length === 0 ? (
          <View style={styles.noCallsContainer}>
            <Text style={styles.noCallsText}>No hay llamadas agendadas.{'\n'}¡Toca el botón '+' para añadir una!</Text>
          </View>
        ) : (
          <FlatList
            data={scheduledCalls}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
