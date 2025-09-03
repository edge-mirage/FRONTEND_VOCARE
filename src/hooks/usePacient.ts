import { useState, useEffect } from 'react';
import { getCurrentPacient } from '@/crud/pacient';

interface PacientData {
  id: number;
  name: string;
  email: string;
  group_uuid?: string;
  voice_id?: string;
  dob?: string;
  last_name?: string;
  middle_name?: string;
  created_at?: string;
  symptoms?: any[];
  events?: any[];
  interests?: any[];
}

export const usePacient = () => {
  const [pacient, setPacient] = useState<PacientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPacient = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando datos del paciente...');
      
      const result = await getCurrentPacient();
      
      if (result.data) {
        setPacient(result.data);
        console.log('✅ Datos del paciente cargados:', result.data);
      } else {
        setPacient(null);
        setError('No se encontraron datos del paciente');
        console.warn('⚠️ No se encontraron datos del paciente');
      }
    } catch (err: any) {
      console.error('❌ Error cargando paciente:', err);
      setError('Error cargando datos del paciente');
      setPacient(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshPacient = () => {
    loadPacient();
  };

  useEffect(() => {
    loadPacient();
  }, []);

  return {
    pacient,
    loading,
    error,
    refreshPacient,
    loadPacient
  };
};