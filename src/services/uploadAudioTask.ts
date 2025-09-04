// src/services/uploadAudioTask.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { getUser } from '@/crud/auth';

// ⚙️ Opcional: si ya tienes un cliente axios como `api` (p. ej. '@/lib/api'), úsalo.
// Descomenta si tienes ese cliente y elimina `client` de acá.
// import api from '@/lib/api';

// Cambia esto si NO usas un cliente axios global.
// Deja BASE_URL apuntando al backend FastAPI (sin el /check-audio-task final).
const BASE_URL = 'http://10.250.108.210:8000'; // <-- EDITA ESTO
const client = axios.create({ baseURL: BASE_URL });

export type UploadResult = {
  user_id: number;
  question_number: number;
  match: boolean;
  similarity: number;
  transcript?: string;
  audio_url?: string | null;
  task_updated: boolean;
  tasks_completed: string[]; // strings "0"/"1"
};

export async function uploadAudioTask(
  fileUri: string,
  questionNumber: number = 1
): Promise<UploadResult> {
  // 1) Obtener usuario
  const user = await getUser();
  if (!user?.id) {
    throw new Error('No se encontró un usuario válido en AsyncStorage.');
  }
  const userId = Number(user.id);

  // 2) Normalizar URI para RN (Android/iOS)
  let uri = fileUri;
  if (!uri.startsWith('file://') && Platform.OS === 'ios') {
    uri = `file://${uri}`;
  }

  // 3) Preparar multipart form-data
  const form = new FormData();
  form.append('audio', {
    uri,
    type: 'audio/m4a',                // m4a; Whisper lo soporta
    name: `tarea_${questionNumber}.m4a`,
  } as any);

  // 4) POST
  // Si usas un cliente preconfigurado `api`, reemplaza `client` por `api`:
  // const { data } = await api.post(`/check-audio-task/${userId}?question_number=${questionNumber}`, form, { ... })
  const { data } = await client.post<UploadResult>(
    `/check-audio-task/${userId}?question_number=${questionNumber}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return data;
}
