import axios from 'axios';
import { Alert } from 'react-native';

// Cambiar este flag a false cuando uses el servidor en la nube
const useLocalServer = true;

const LOCAL_URL = 'http://10.0.2.2:8000'; // o 10.0.2.2 si estás usando emulador Android
const PROD_URL = 'https://tu-servidor.com'; // cambia por tu dominio real

export const URL = useLocalServer ? LOCAL_URL : PROD_URL;

// Tipado de usuario (debe coincidir con el backend)
export interface Usuario {
  id: number;
  name: string;
  email: string;
  password: string;
  group_uuid?: string;
  voice_id?: string;
  password_hash?: string;
  dob?: string;
  last_name?: string;
  created_at?: string;
  middle_name?: string;
  email_verified?: boolean;
}

export interface CreateUsuario {
  name: string;
  email: string;
  password: string;
  dob?: string;
  last_name?: string;
  middle_name?: string;
}

// ------------------ API CALLS ------------------

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await axios.get(`${URL}/user`);
  return res.data;
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  const res = await axios.get(`${URL}/user/${id}`);
  return res.data;
};

export const crearUsuario = async (data: CreateUsuario): Promise<Usuario> => {
  const res = await axios.post(`${URL}/user`, data);
  return res.data.user;
};

export const actualizarUsuario = async (id: number, data: CreateUsuario): Promise<Usuario> => {
  const res = await axios.put(`${URL}/user/${id}`, data);
  return res.data;
};

export const eliminarUsuario = async (id: number): Promise<{ message: string }> => {
  const res = await axios.delete(`${URL}/user/${id}`);
  return res.data;
};

export const recuperarContrasena = async (email: string): Promise<Usuario> => {
  const res = await axios.post(`${URL}/user/recover-password`, null, {
    params: { email },
  });
  return res.data;
};

export const verificarCuenta = async (user_id: number): Promise<{ message: string }> => {
  const res = await axios.get(`${URL}/user/verify_account/${user_id}`);
  return res.data;
};

export const enviarEmail = async (): Promise<{ message: string }> => {
  const res = await axios.get(`${URL}/user/sendemail`);
  return res.data;
};
