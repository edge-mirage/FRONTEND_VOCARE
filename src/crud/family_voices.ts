import api from './auth'; // Usar la instancia autenticada

// Respuesta del backend:
// { voices: [ [ nombre: string, voice_id: string ], ... ] }
export async function obtenerVocesPorGrupo(groupUuid: string): Promise<Array<[string, string]>> {
  const res = await api.get(`/family-voices/by-group/${groupUuid}`);
  return res.data?.voices ?? [];
}
