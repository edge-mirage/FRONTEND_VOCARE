

// src/screens/Replicaciones/ReplicacionScreenSure.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<
  ReplicacionStackParamList,
  'ReplicacionScreenSure'
>;

const API_URL = __DEV__
  ? 'http://10.0.2.2:8000/api/replicacion/audio'
  : 'https://tu-dominio/api/replicacion/audio';

type Status = 'review' | 'uploading' | 'errorUpload' | 'errorMatch';

// Mock para simular respuesta del backend
const mockBackendCheck = async (): Promise<'ok' | 'lowMatch'> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const r = Math.random() > 0.5 ? 'ok' : 'lowMatch';
      resolve(r);
    }, 2000);
  });
};

export default function ReplicacionScreenSure({ route, navigation }: Props) {
  const audio = route.params?.audio;
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<Status>('review');

  const durationSec = audio?.durationSec ?? 0;
  const mm = String(Math.floor(durationSec / 60)).padStart(2, '0');
  const ss = String(durationSec % 60).padStart(2, '0');

  const uploadAudio = async () => {
    if (status === 'uploading' || !audio?.uri) return;
    setStatus('uploading');

    try {
      // Aquí iría tu llamada real al backend
      const result = await mockBackendCheck();

      if (result === 'ok') {
        navigation.replace('Replicacion', { justRecorded: true });
      } else {
        setStatus('errorMatch');
      }
    } catch {
      setStatus('errorUpload');
    }
  };

  return (
    <View style={styles.overlay}>
      {status === 'uploading' && (
        // ======= PROCESANDO =======
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingTitle}>
            Tu audio está siendo procesado.
          </Text>
          <Text style={styles.processingText}>Espera unos segundos.</Text>
        </View>
      )}

      {status === 'errorMatch' && (
        // ======= ERROR DE COINCIDENCIA =======
        <View style={styles.card}>
          <Ionicons name="sad-outline" size={36} color={colors.primary} />
          <Text style={styles.title}>
            El audio no coincide en el{' '}
            <Text style={{ fontWeight: '800' }}>80% mínimo</Text> para poder ser
            aceptado.
          </Text>
          <Text style={styles.processingText}>Favor grabar de nuevo.</Text>

          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.btn, styles.btnGhost]}
              onPress={() => setStatus('review')}
            >
              <Text style={styles.btnGhostText}>Reintentar</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => navigation.popToTop()}
            >
              <Text style={styles.btnPrimaryText}>Salir</Text>
            </Pressable>
          </View>
        </View>
      )}

      {status === 'errorUpload' && (
        // ======= ERROR DE SUBIDA =======
        <View style={styles.card}>
          <Text style={styles.errorText}>
            Hubo un problema al enviar el audio. Intenta nuevamente.
          </Text>
          <Pressable
            style={[styles.btn, styles.btnGhost, { marginTop: spacing.md }]}
            onPress={() => setStatus('review')}
          >
            <Text style={styles.btnGhostText}>Volver</Text>
          </Pressable>
        </View>
      )}

      {status === 'review' && (
        // ======= REVISIÓN =======
        <View style={styles.card}>
          <Pressable style={styles.close} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={20} color={colors.primary} />
          </Pressable>

          <View style={styles.logoWrap}>
            <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>
            El siguiente <Text style={{ fontWeight: '800' }}>audio</Text> se
            utilizará para el entrenamiento de reconocer tu voz.
          </Text>

          {/* Player mock */}
          <View style={styles.player}>
            <Pressable
              onPress={() => setIsPlaying((v) => !v)}
              style={styles.playBtn}
              disabled={!audio}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color="#fff"
              />
            </Pressable>
            <Ionicons
              name="pulse"
              size={24}
              color={colors.primary}
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.duration}>
              {mm}:{ss}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            {/* DESCARTAR */}
            <Pressable
              style={[styles.btn, styles.btnTextOnly]}
              onPress={() => {
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate({
                    name: 'ReconocimientoVoz',
                    params: { reset: true },
                    merge: true,
                  } as never);
                }, 0);
              }}
            >
              <Text style={styles.btnTextOnlyLabel}>Descartar audio</Text>
            </Pressable>

            {/* ACEPTAR */}
            <Pressable
              style={[styles.btn, styles.btnPrimary, !audio && { opacity: 0.5 }]}
              disabled={!audio}
              onPress={uploadAudio}
            >
              <Text style={styles.btnPrimaryText}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: colors.card ?? '#fff',
    padding: spacing.xl,
    position: 'relative',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    alignItems: 'center',
  },
  close: { position: 'absolute', right: spacing.md, top: spacing.md, padding: 6 },
  logoWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0E5F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    color: colors.text,
    opacity: 0.95,
    marginBottom: spacing.lg,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f0fb',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: spacing.lg,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    marginLeft: 10,
    color: colors.text,
    opacity: 0.7,
    fontWeight: '600',
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
  btnGhost: { backgroundColor: '#eee' },
  btnGhostText: { color: '#2b2b2b', fontWeight: '700' },
  btnTextOnly: { backgroundColor: 'transparent' },
  btnTextOnlyLabel: {
    color: colors.textMuted ?? '#6B6B6B',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

  // Procesando
  processingTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  processingText: {
    marginTop: spacing.sm,
    color: colors.text,
    opacity: 0.85,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing.md,
    color: '#B00020',
    textAlign: 'center',
    fontWeight: '700',
  },
});


//LUCAS PARA CONECTAR ENTONCES HACES ALGO ASÍ

// import React, { useEffect } from 'react';
// import { View, Button, Text } from 'react-native';
// import { RouteProp } from '@react-navigation/native';
// import { ReplicacionStackParamList } from '../navigation/types';
// import { enviarAudioAlBackend, AudioFile, obtenerAudioMock } from '../services/audioService';

// type Props = {
//   route: RouteProp<ReplicacionStackParamList, 'ReplicacionScreenSure'>;
// };

// const ReplicacionScreenSure: React.FC<Props> = ({ route }) => {
//   const audio = route.params?.audio || obtenerAudioMock(); // Usamos mock si no llega audio real

//   const handleEnviarAudio = async () => {
//     try {
//       const resultado = await enviarAudioAlBackend(audio);
//       console.log('Respuesta del backend:', resultado);
//     } catch (error) {
//       console.error('Error enviando audio al backend:', error);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Audio listo para enviar</Text>
//       <Text>Nombre: {audio.name}</Text>
//       <Text>Duración: {audio.durationSec}s</Text>
//       <Button title="Enviar Audio al Backend" onPress={handleEnviarAudio} />
//     </View>
//   );
// };

// export default ReplicacionScreenSure;

