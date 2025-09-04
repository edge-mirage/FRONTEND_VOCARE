import api from './auth';           // tu cliente axios autenticado
import { Platform } from 'react-native';
import { getUser } from '@/crud/auth';

export type UploadResult = {
  user_id: number;
  question_number: number;
  match: boolean;
  similarity: number;
  transcript?: string;
  audio_url?: string | null;
  task_updated: boolean;
  tasks_completed: string[];
};

export async function uploadAudioTask(fileUri: string, questionNumber: number) {
  const user = await getUser();
  const userId = Number(user?.id);
  if (!userId) throw new Error('No se encontró el usuario autenticado.');

  let uri = fileUri;
  if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
    uri = `file://${uri}`;
  }

  const form = new FormData();
  form.append('audio', {
    uri,
    type: 'audio/m4a',
    name: `tarea_${questionNumber}.m4a`,
  } as any);

  const { data } = await api.post<UploadResult>(
    `/check-audio-task/${userId}?question_number=${questionNumber}`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}
