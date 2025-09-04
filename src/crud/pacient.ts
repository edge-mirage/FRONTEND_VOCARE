import api from './auth'; // Usar la instancia autenticada
import { StorageService } from '@/services/StorageService';

// Usar la misma base URL que auth.ts para consistencia
import { BASE_URL } from './auth';

const PACIENT_BASE = `${BASE_URL}/pacients`;

export const createPacient = async (pacientData: any) => {
  try {
    console.log('📤 [API] Enviando datos del paciente:', pacientData);
    
    // ✅ ASEGURAR QUE LOS DATOS ESTÁN EN EL FORMATO CORRECTO
    const formattedData = {
      ...pacientData,
      // Asegurar que grupo_uuid sea string si existe
      grupo_uuid: pacientData.grupo_uuid ? String(pacientData.grupo_uuid) : undefined,
      // Asegurar que interests sea array de objetos si existe
      interests: Array.isArray(pacientData.interests) ? pacientData.interests : [],
      // Asegurar que symptoms y events sean arrays
      symptoms: pacientData.symptoms || [],
      events: pacientData.events || []
    };
    
    const response = await api.post(`/pacients/`, formattedData);
    console.log('✅ [API] Paciente creado exitosamente:', response.data);
    return { data: response.data, status: response.status };
  } catch (error: any) {
    console.error('❌ [API] Error creando paciente:', error);
    throw error;
  }
};

export const getPacients = async () => {
  const response = await api.get(`/pacients/`);
  return { data: response.data, status: response.status };
};

export const getPacientById = async (id: number) => {
  try {
    const response = await api.get(`/pacients/${id}`);
    return { data: response.data, status: response.status };
  } catch (error: any) {
    console.error(`❌ Error obteniendo paciente ${id}:`, error);
    // Si es 404, retornar null en lugar de error
    if (error.response?.status === 404) {
      return { data: null, status: 404 };
    }
    throw error;
  }
};

export const getPacientByGroupUuid = async (groupUuid?: string) => {
  try {
    // Si no se proporciona groupUuid, obtenerlo del storage
    const uuid = groupUuid || await StorageService.getGroupUuid();
    
    if (!uuid) {
      console.warn('⚠️ No hay group_uuid disponible');
      return { data: null, status: 404 };
    }

    console.log('🔍 Obteniendo paciente por group_uuid:', uuid);
    const response = await api.get(`/pacients/group/${uuid}`);
    console.log('✅ Paciente obtenido por group_uuid:', response.data);
    return { data: response.data, status: response.status };
  } catch (error: any) {
    console.error('❌ Error obteniendo paciente por group_uuid:', error);
    if (error.response?.status === 404) {
      return { data: null, status: 404 };
    }
    throw error;
  }
};

export const getCurrentPacient = async () => {
  try {
    console.log('🔍 Obteniendo paciente actual...');
    
    // Primero intentar por group_uuid
    const groupResult = await getPacientByGroupUuid();
    if (groupResult.data) {
      console.log('✅ Paciente encontrado por group_uuid');
      return groupResult;
    }

    // Si no funciona por group_uuid, intentar por ID del usuario
    const pacientId = await StorageService.getPacientId();
    if (pacientId) {
      console.log('🔍 Intentando obtener paciente por ID:', pacientId);
      const idResult = await getPacientById(pacientId);
      if (idResult.data) {
        console.log('✅ Paciente encontrado por ID');
        return idResult;
      }
    }

    console.warn('⚠️ No se pudo obtener datos del paciente actual');
    return { data: null, status: 404 };
  } catch (error) {
    console.error('❌ Error obteniendo paciente actual:', error);
    return { data: null, status: 500 };
  }
};

export const updatePacient = async (id: number, pacientData: any) => {
  const response = await api.put(`/pacients/${id}`, pacientData);
  return { data: response.data, status: response.status };
};

export const deletePacient = async (id: number) => {
  const response = await api.delete(`/pacients/${id}`);
  return { data: response.data, status: response.status };
};

// ========== SYMPTOMS POR GROUP UUID ==========
export const addSymptomByGroup = async (symptom: any, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.post(`/pacients/group/${uuid}/symptoms`, symptom);
  return { data: response.data, status: response.status };
};

export const updateSymptomByGroup = async (index: number, symptom: any, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.put(`/pacients/group/${uuid}/symptoms/${index}`, symptom);
  return { data: response.data, status: response.status };
};

export const deleteSymptomByGroup = async (index: number, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.delete(`/pacients/group/${uuid}/symptoms/${index}`);
  return { data: response.data, status: response.status };
};

// ========== EVENTS POR GROUP UUID ==========
export const addEventByGroup = async (event: any, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.post(`/pacients/group/${uuid}/events`, event);
  return { data: response.data, status: response.status };
};

export const updateEventByGroup = async (index: number, event: any, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.put(`/pacients/group/${uuid}/events/${index}`, event);
  return { data: response.data, status: response.status };
};

export const deleteEventByGroup = async (index: number, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.delete(`/pacients/group/${uuid}/events/${index}`);
  return { data: response.data, status: response.status };
};

// ========== INTERESTS POR GROUP UUID ==========
export const addInterestByGroup = async (interest: { nombre: string; descripcion?: string }, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.post(`/pacients/group/${uuid}/interests`, interest);
  return { data: response.data, status: response.status };
};

export const updateInterestByGroup = async (index: number, interest: { nombre: string; descripcion?: string }, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.put(`/pacients/group/${uuid}/interests/${index}`, interest);
  return { data: response.data, status: response.status };
};

export const deleteInterestByGroup = async (index: number, groupUuid?: string) => {
  const uuid = groupUuid || await StorageService.getGroupUuid();
  if (!uuid) throw new Error('No hay group_uuid disponible');
  
  const response = await api.delete(`/pacients/group/${uuid}/interests/${index}`);
  return { data: response.data, status: response.status };
};

// ========== LEGACY METHODS (por ID) ==========
// Mantenemos estos métodos por compatibilidad
export const addSymptom = async (id: number, symptom: any) => {
  const response = await api.post(`/pacients/${id}/symptoms`, symptom);
  return { data: response.data, status: response.status };
};

export const updateSymptom = async (id: number, index: number, symptom: any) => {
  const response = await api.put(`/pacients/${id}/symptoms/${index}`, symptom);
  return { data: response.data, status: response.status };
};

export const deleteSymptom = async (id: number, index: number) => {
  const response = await api.delete(`/pacients/${id}/symptoms/${index}`);
  return { data: response.data, status: response.status };
};

export const addEvent = async (id: number, event: any) => {
  const response = await api.post(`/pacients/${id}/events`, event);
  return { data: response.data, status: response.status };
};

export const updateEvent = async (id: number, index: number, event: any) => {
  const response = await api.put(`/pacients/${id}/events/${index}`, event);
  return { data: response.data, status: response.status };
};

export const deleteEvent = async (id: number, index: number) => {
  const response = await api.delete(`/pacients/${id}/events/${index}`);
  return { data: response.data, status: response.status };
};

export const addInterest = async (
  pacientId: number,
  interest: { nombre: string; descripcion?: string }
) => {
  const response = await api.post(`/pacients/${pacientId}/interests`, interest);
  return { data: response.data, status: response.status };
};

export const updateInterest = async (id: number, index: number, interest: string) => {
  const response = await api.put(`/pacients/${id}/interests/${index}`, interest);
  return { data: response.data, status: response.status };
};

export const deleteInterest = async (id: number, index: number) => {
  const response = await api.delete(`/pacients/${id}/interests/${index}`);
  return { data: response.data, status: response.status };
};
