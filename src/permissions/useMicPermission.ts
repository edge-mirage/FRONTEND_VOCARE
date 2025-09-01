// src/permissions/useMicPermission.ts
import { useEffect, useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import {
  check,
  request,
  openSettings,
  RESULTS,
  PERMISSIONS,
  type PermissionStatus,
} from 'react-native-permissions';

const MIC_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.MICROPHONE
    : PERMISSIONS.ANDROID.RECORD_AUDIO;

export function useMicPermissionOnLaunch() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);

  const ensureMicPermission = useCallback(async () => {
    let st = await check(MIC_PERMISSION);

    if (st === RESULTS.DENIED) {
      st = await request(MIC_PERMISSION);
    }

    if (st === RESULTS.BLOCKED) {
      Alert.alert(
        'Permiso de micrófono',
        'Necesitamos acceso al micrófono para las llamadas.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir ajustes',
            onPress: () => {
              // NO devolver la Promise; simplemente ejecutar
              if (Platform.OS === 'android') {
                void openSettings('application'); // o 'notifications' si prefieres
              } else {
                void openSettings();
              }
            },
          },
        ],
      );
    }

    setStatus(st);
    return st === RESULTS.GRANTED || st === RESULTS.LIMITED;
  }, []);

  useEffect(() => {
    void ensureMicPermission();
  }, [ensureMicPermission]);

  return {
    micGranted: status === RESULTS.GRANTED || status === RESULTS.LIMITED,
    status,
    ensureMicPermission,
  };
}
