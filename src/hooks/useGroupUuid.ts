// src/hooks/useGroupUuid.ts
import { useEffect, useState } from 'react';
import { StorageService } from '@/services/StorageService';

export function useGroupUuid() {
  const [groupUuid, setGroupUuid] = useState<string | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const uuid = await StorageService.getGroupUuid();
        setGroupUuid(uuid ?? null);
      } finally {
        setLoadingGroup(false);
      }
    })();
  }, []);

  return { groupUuid, loadingGroup };
}
