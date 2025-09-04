// src/hooks/useGroupVoices.ts
import { useCallback, useEffect, useState } from 'react';
import { StorageService } from '@/services/StorageService';
import { obtenerVocesPorGrupo } from '@/crud/family_voices';

export interface GroupVoice {
  id: string;    // voice_id ("" para "Por defecto")
  label: string; // lo que se muestra (nombre o "Por defecto")
  name: string;  // nombre real
}

export function useGroupVoices(groupUuidOverride?: string) {
  const [voices, setVoices] = useState<GroupVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const gUuid = groupUuidOverride ?? (await StorageService.getGroupUuid?.());
      if (!gUuid) {
        setVoices([{ id: '', label: 'Por defecto', name: 'Por defecto' }]);
        return;
      }

      const raw = await obtenerVocesPorGrupo(String(gUuid));
      const mapped: GroupVoice[] = raw.map(([nombre, voiceId]) => ({
        id: voiceId ?? '',
        label: nombre ?? 'Sin nombre',
        name: nombre ?? 'Sin nombre',
      }));

      setVoices([
        { id: '', label: 'Por defecto', name: 'Por defecto' }, // opción extra requerida
        ...mapped,
      ]);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando voces');
      // aún así ofrecemos "Por defecto"
      setVoices([{ id: '', label: 'Por defecto', name: 'Por defecto' }]);
    } finally {
      setLoading(false);
    }
  }, [groupUuidOverride]);

  useEffect(() => { void load(); }, [load]);

  return { voices, loading, error, reload: load };
}
