// src/hooks/useTasksCompleted.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTasksCompleted } from '@/crud/progress_voices';
import { StorageService } from '@/services/StorageService';
import { getUser } from '@/crud/auth';

const TOTAL_TASKS = 9;

function normalizeTasksCompleted(raw: Array<number | boolean> | null | undefined): boolean[] {
  // Caso vacío ⇒ todas pendientes
  if (!raw || raw.length === 0) return Array.from({ length: TOTAL_TASKS }, () => false);

  // ¿Es array booleans/0-1 del tamaño TOTAL_TASKS?
  const isBooleanLike = raw.every(v => typeof v === 'boolean' || v === 0 || v === 1);
  if (isBooleanLike) {
    const asBool = raw.map(v => Boolean(v));
    // pad/truncate a TOTAL_TASKS
    const out = Array.from({ length: TOTAL_TASKS }, (_, i) => Boolean(asBool[i] ?? false));
    return out;
  }

  // Si llega como array de índices 1-based (p.ej. [2,5])
  const out = Array.from({ length: TOTAL_TASKS }, () => false);
  for (const v of raw) {
    if (typeof v === 'number') {
      const idx = v - 1; // 1-based → 0-based
      if (idx >= 0 && idx < TOTAL_TASKS) out[idx] = true;
    }
  }
  return out;
}

async function resolveUserId(explicitUserId?: number): Promise<number | null> {
  if (typeof explicitUserId === 'number') return explicitUserId;
  // si tienes esto en tu StorageService
  // @ts-expect-error - si no existe, caerá en el catch
  if (typeof StorageService.getUserId === 'function') {
    try {
      // @ts-expect-error - ver comentario arriba
      const uid = await StorageService.getUserId();
      if (typeof uid === 'number') return uid;
      if (typeof uid === 'string' && uid.trim() !== '' && !Number.isNaN(Number(uid))) {
        return Number(uid);
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export function useTasksCompleted(userId?: number) {
  const [tasks, setTasks] = useState<boolean[]>(() => Array.from({ length: TOTAL_TASKS }, () => false));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getUser();
      if (!user?.id) {
        throw new Error('No se encontró un usuario válido en AsyncStorage.');
      }
      const userId = Number(user.id);
      if (userId == null) {
        setTasks(Array.from({ length: TOTAL_TASKS }, () => false));
        setError('No hay user_id disponible');
        return;
      }

      const data = await getTasksCompleted(userId);
      const normalized = normalizeTasksCompleted(data?.tasks_completed);
      setTasks(normalized);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  const doneCount = useMemo(() => tasks.filter(Boolean).length, [tasks]);

  return { tasks, doneCount, loading, error, reload: load, total: TOTAL_TASKS };
}
