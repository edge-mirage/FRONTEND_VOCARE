// src/services/audioService.ts
// Este archivo maneja la lógica para enviar audios al backend.
// Soporta archivos en formato MP4 o WAV.
// Los audios provienen del mockeo (simulación) en la app.

export type AudioFile = {
  uri: string;           // URI local del archivo de audio (ej: 'file://.../audio.wav')
  type: string;          // MIME type del archivo, ej: 'audio/wav' o 'audio/mp4'
  name: string;          // Nombre del archivo, ej: 'grabacion1.wav'
  durationSec: number;   // Duración en segundos del audio
  createdAt: number;     // Timestamp de creación
};

/**
 * Función para enviar un audio al backend.
 * @param audio - objeto AudioFile
 * @returns Promise con la respuesta del backend
 */
export const enviarAudioAlBackend = async (audio: AudioFile) => {
  try {
    // FormData permite enviar archivos a través de HTTP POST
    const formData = new FormData();
    formData.append('file', {
      uri: audio.uri,
      type: audio.type,
      name: audio.name,
    } as any); // 'as any' porque React Native FormData requiere 'any' para archivos

    // Puedes añadir campos extra si tu backend lo necesita
    formData.append('durationSec', audio.durationSec.toString());
    formData.append('createdAt', audio.createdAt.toString());

    // URL del endpoint del backend que recibe el audio
    const response = await fetch('https://mi-backend.com/api/audios', {
      method: 'POST',
      body: formData,
      headers: {
        // Importante: no poner 'Content-Type', fetch lo define automáticamente para multipart/form-data
        Accept: 'application/json',
      },
    });

    // Parsear la respuesta JSON del backend
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar audio:', error);
    throw error;
  }
};

/**
 * Función mock para simular audios de la app.
 * Esto permite desarrollo sin el backend listo.
 */
export const obtenerAudioMock = (): AudioFile => {
  return {
    uri: 'file:///mock/audio_ejemplo.wav', // Ruta simulada
    type: 'audio/wav',
    name: 'audio_ejemplo.wav',
    durationSec: 5,
    createdAt: Date.now(),
  };
};
