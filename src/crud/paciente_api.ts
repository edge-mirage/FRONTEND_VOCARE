import api from './auth';  // Usa el cliente Axios que maneja el token y refresh


export async function insertarSintomasFisicos({
  sintomas,
  paciente_id,
}: {
  sintomas: string[];
  paciente_id: string;
}) {
  // Convertimos ["x", "y"] a [{nombre: "x"}, {nombre: "y"}] para tu modelo
  const symptoms = sintomas.map(nombre => ({ nombre }));

  // Endpoint, ajústalo si usas prefijo /api o distinto path
  const endpoint = `/paciente/${paciente_id}/sintomas-fisicos`;

  try {
    // Axios ya mete el token automáticamente gracias al interceptor de auth.ts
    const response = await api.post(endpoint, { symptoms });

    // Si el backend responde 2xx, todo bien
    return response.data;
  } catch (error: any) {
    // Extrae el mensaje de error si lo manda el backend
    let msg = 'Error guardando síntomas';
    if (error.response?.data?.detail) msg = error.response.data.detail;
    throw new Error(msg);
  }
}
