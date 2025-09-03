// src/hooks/useUserContexts.ts
import { useEffect, useState, useCallback } from 'react';
import { StorageService } from '@/services/StorageService';
import { obtenerContextoPorGrupo } from '@/crud/family';

export interface UserContextItem {
  id: number;
  title: string;
  description: string;
}

export function useUserContexts() {
  const [contexts, setContexts] = useState<UserContextItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const groupUuid = await StorageService.getGroupUuid();
      if (!groupUuid) {
        setContexts([]);
        return;
      }
      const ctx = await obtenerContextoPorGrupo(groupUuid);
      setContexts(ctx?.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando contextos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { contexts, loading, error, reload: load };
}
