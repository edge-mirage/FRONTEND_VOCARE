import axios from 'axios';
import { UUID } from 'crypto';

const useLocalServer = true;
const LOCAL_URL = 'http://10.0.2.2:8000';
const PROD_URL = 'https://tu-servidor.com';
export const URL = useLocalServer ? LOCAL_URL : PROD_URL;

// ================= FAMILY GROUP =================
export const crearGrupoFamiliar = async (data: any) => {
  const res = await axios.post(`${URL}/family-groups`, data);
  return res.data;
};

export const obtenerGruposFamiliares = async () => {
  const res = await axios.get(`${URL}/family-groups`);
  return res.data;
};

export const obtenerGrupoFamiliar = async (uuid: UUID) => {
  const res = await axios.get(`${URL}/family-groups/${uuid}`);
  return res.data;
};

export const actualizarGrupoFamiliar = async (uuid: UUID, data: any) => {
  const res = await axios.put(`${URL}/family-groups/${uuid}`, data);
  return res.data;
};

export const eliminarGrupoFamiliar = async (uuid: UUID) => {
  const res = await axios.delete(`${URL}/family-groups/${uuid}`);
  return res.data;
};

// ================= FAMILY GROUP CONTEXT =================
export const crearContextoGrupo = async (data: any) => {
  const res = await axios.post(`${URL}/family-group-contexts`, data);
  return res.data;
};

export const obtenerTodosContextos = async () => {
  const res = await axios.get(`${URL}/family-group-contexts/GetAllFamilyGroupContext`);
  return res.data;
};

export const obtenerContextoPorGrupo = async (grupo_uuid: UUID) => {
  const res = await axios.get(`${URL}/family-group-contexts/GetFamilyGroupContextByGrupoUuid/${grupo_uuid}`);
  return res.data;
};

export const actualizarContextoGrupo = async (grupo_uuid: UUID, data: any) => {
  const res = await axios.put(`${URL}/family-group-contexts/${grupo_uuid}`, data);
  return res.data;
};

export const eliminarContextoGrupo = async (grupo_uuid: UUID) => {
  const res = await axios.delete(`${URL}/family-group-contexts/${grupo_uuid}`);
  return res.data;
};

// ================= FAMILY GROUP CONTEXT ITEM =================
export const crearContextItem = async (data: any) => {
  const res = await axios.post(`${URL}/family-group-context-items/`, data);
  return res.data;
};

export const obtenerTodosContextItems = async () => {
  const res = await axios.get(`${URL}/family-group-context-items/`);
  return res.data;
};

export const obtenerContextItem = async (item_id: number) => {
  const res = await axios.get(`${URL}/family-group-context-items/${item_id}/`);
  return res.data;
};

export const actualizarContextItem = async (item_id: number, data: any) => {
  const res = await axios.put(`${URL}/family-group-context-items/${item_id}/`, data);
  return res.data;
};

export const eliminarContextItem = async (item_id: number) => {
  const res = await axios.delete(`${URL}/family-group-context-items/${item_id}/`);
  return res.data;
};
