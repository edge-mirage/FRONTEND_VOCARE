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


export const verificarEmailExiste = async (email: string): Promise<EmailVerificationResult> => {
  try {
    console.log('🔍 [USER_CRUD] Verificando email existe - URL:', `${URL}/user/verify-email-exists`);
    console.log('📤 [USER_CRUD] Request body:', { email });
    
    const res = await axios.post(`${URL}/user/verify-email-exists`, { email }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // ✅ Acepta 400 y 404 como respuestas válidas
      }
    });
    
    console.log('✅ [USER_CRUD] Response recibida:', res.data);
    console.log('📊 [USER_CRUD] Response status:', res.status);
    
    // ✅ El backend puede retornar 404 para email no encontrado
    if (res.status === 404) {
      return {
        exists: false,
        message: 'Email no encontrado en el sistema',
        email: email,
        error_type: 'not_found'
      };
    }
    
    // ✅ El backend puede retornar 400 para formato inválido
    if (res.status === 400) {
      return {
        exists: false,
        message: res.data.detail || 'Formato de email inválido',
        email: email,
        error_type: 'invalid_format'
      };
    }
    
    // ✅ Retornar el objeto completo del backend
    return res.data;
    
  } catch (error: any) {
    console.error("❌ [USER_CRUD] Error verificando email:", error);
    console.error("❌ [USER_CRUD] Error response:", error.response?.data);
    console.error("❌ [USER_CRUD] Error status:", error.response?.status);
    console.error("❌ [USER_CRUD] Error config URL:", error.config?.url);
    
    // ✅ Manejo específico del error 405
    if (error.response?.status === 405) {
      console.error("❌ [USER_CRUD] ERROR 405 - Method Not Allowed");
      console.error("❌ [USER_CRUD] URL probada:", error.config?.url);
      console.error("❌ [USER_CRUD] Método usado:", error.config?.method);
      
      return {
        exists: false,
        message: 'Error del servidor - Método no permitido',
        email: email,
        error_type: 'method_not_allowed'
      };
    }
    
    // ✅ Otros errores
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
    const res = await axios.post(`${URL}/user/change-password-with-code`, {
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