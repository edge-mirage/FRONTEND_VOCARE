// Redirigir a las funciones de pacient.ts para mantener compatibilidad
import { createPacient, addSymptomByGroup } from './pacient';

// ✅ SIMPLIFICAR - USAR DIRECTAMENTE LAS FUNCIONES DE pacient.ts
export const crearPaciente = createPacient;

export async function enviarSintomasBatch({
  sintomas,
  grupo_uuid,
}: {
  sintomas: string[];
  grupo_uuid?: string;
}) {
  const requests = sintomas.map(nombre => 
    addSymptomByGroup(
      { 
        nombre,
        descripcion: '' 
      },
      grupo_uuid
    )
  );
  
  return Promise.all(requests);
}
