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
export interface EmailVerificationResult {
  exists: boolean;
  message: string;
  email: string;
  user_id?: number;
  name?: string;
  email_verified?: boolean;
  error_type?: string;
}
// ------------------ API CALLS ------------------

export const getUsuarios = async (): Promise<Usuario[]> => {
  const res = await axios.get(`${URL}/users`);
  return res.data;
};

export const getUsuarioById = async (id: number): Promise<Usuario> => {
  const res = await axios.get(`${URL}/users/${id}`);
  return res.data;
};

export const crearUsuario = async (data: CreateUsuario): Promise<Usuario> => {
  const res = await axios.post(`${URL}/users`, data);
  return res.data.user;
};

export const actualizarUsuario = async (id: number, data: CreateUsuario): Promise<Usuario> => {
  const res = await axios.put(`${URL}/users/${id}`, data);
  return res.data;
};

export const eliminarUsuario = async (id: number): Promise<{ message: string }> => {
  const res = await axios.delete(`${URL}/users/${id}`);
  return res.data;
};

export const recuperarContrasena = async (email: string): Promise<Usuario> => {
  const res = await axios.post(`${URL}/users/recover-password`, null, {
    params: { email },
  });
  return res.data;
};

export const verificarCuenta = async (user_id: number): Promise<{ message: string }> => {
  const res = await axios.get(`${URL}/users/verify_account/${user_id}`);
  return res.data;
};

export const enviarEmail = async (): Promise<{ message: string }> => {
  const res = await axios.get(`${URL}/users/sendemail`);
  return res.data;
};


export const verificarEmailExiste = async (email: string): Promise<EmailVerificationResult> => {
  try {
    // ✅ CORREGIR URL - usar /users/ (plural)
    console.log('🔍 [USER_CRUD] Verificando email existe - URL:', `${URL}/users/verify-email-exists`);
    console.log('📤 [USER_CRUD] Request body:', { email });

    const res = await axios.post(`${URL}/users/verify-email-exists`, { email }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('✅ [USER_CRUD] Response recibida:', res.data);
    console.log('📊 [USER_CRUD] Response status:', res.status);
    
    return res.data;
    
  } catch (error: any) {
    console.error("❌ [USER_CRUD] Error verificando email:", error);
    
    return {
      exists: false,
      message: 'Error verificando email',
      email: email,
      error_type: 'network_error'
    };
  }
};

export const cambiarContrasenaConCodigo = async (email: string, code: string, newPassword: string) => {
  try {
    console.log('🔐 [USER_CRUD] Cambiando contraseña con código');
    const res = await axios.post(`${URL}/users/change-password-with-code`, {
      email: email.toLowerCase().trim(),
      code: code.toUpperCase().trim(),
      new_password: newPassword
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 20000
    });
    
    return res.data;
  } catch (error) {
    console.error("❌ [USER_CRUD] Error cambiando contraseña:", error);
    throw error;
  }
};