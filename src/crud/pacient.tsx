import axios from 'axios';

const useLocalServer = true;
export const URL = useLocalServer
  ? 'http://10.0.2.2:8000'
  : 'https://tu-servidor-en-produccion.com';

const PACIENT_BASE = `${URL}/pacients`;

export const createPacient = async (pacientData: any) => {
  const response = await axios.post(`${PACIENT_BASE}/`, pacientData);
  return { data: response.data, status: response.status };
};

export const getPacients = async () => {
  const response = await axios.get(`${PACIENT_BASE}/`);
  return { data: response.data, status: response.status };
};

export const getPacientById = async (id: number) => {
  const response = await axios.get(`${PACIENT_BASE}/${id}`);
  return { data: response.data, status: response.status };
};

export const updatePacient = async (id: number, pacientData: any) => {
  const response = await axios.put(`${PACIENT_BASE}/${id}`, pacientData);
  return { data: response.data, status: response.status };
};

export const deletePacient = async (id: number) => {
  const response = await axios.delete(`${PACIENT_BASE}/${id}`);
  return { data: response.data, status: response.status };
};

// SYMPTOMS
export const addSymptom = async (id: number, symptom: any) => {
  const response = await axios.post(`${PACIENT_BASE}/${id}/symptoms`, symptom);
  return { data: response.data, status: response.status };
};

export const updateSymptom = async (id: number, index: number, symptom: any) => {
  const response = await axios.put(`${PACIENT_BASE}/${id}/symptoms/${index}`, symptom);
  return { data: response.data, status: response.status };
};

export const deleteSymptom = async (id: number, index: number) => {
  const response = await axios.delete(`${PACIENT_BASE}/${id}/symptoms/${index}`);
  return { data: response.data, status: response.status };
};

// EVENTS
export const addEvent = async (id: number, event: any) => {
  const response = await axios.post(`${PACIENT_BASE}/${id}/events`, event);
  return { data: response.data, status: response.status };
};

export const updateEvent = async (id: number, index: number, event: any) => {
  const response = await axios.put(`${PACIENT_BASE}/${id}/events/${index}`, event);
  return { data: response.data, status: response.status };
};

export const deleteEvent = async (id: number, index: number) => {
  const response = await axios.delete(`${PACIENT_BASE}/${id}/events/${index}`);
  return { data: response.data, status: response.status };
};

// INTERESTS

export const addInterest = async (
  pacientId: number,
  interest: { nombre: string; descripcion?: string }
) => {
  const response = await axios.post(`${PACIENT_BASE}/${pacientId}/interests`, interest);
  return { data: response.data, status: response.status };
};

export const updateInterest = async (id: number, index: number, interest: string) => {
  const response = await axios.put(`${PACIENT_BASE}/${id}/interests/${index}`, interest);
  return { data: response.data, status: response.status };
};

export const deleteInterest = async (id: number, index: number) => {
  const response = await axios.delete(`${PACIENT_BASE}/${id}/interests/${index}`);
  return { data: response.data, status: response.status };
};
