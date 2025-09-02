import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AudioRecord from 'react-native-audio-record';

import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'ReconocimientoVoz'>;
type R   = RouteProp<ReplicacionStackParamList, 'ReconocimientoVoz'>;

export default function ReconocimientoVozScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);

  // Contador mientras se graba
  useEffect(() => {
    if (!isRecording) return;
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  // RESET (cuando vienes de "Descartar audio" en el modal)
  useEffect(() => {
    if (route.params?.reset) {
      finishedRef.current = false;
      setSeconds(0);
      setIsRecording(false);
      navigation.setParams({ reset: undefined } as any);
    }
  }, [route.params?.reset, navigation]);

  // Permiso de micrófono (solo Android; en iOS config Info.plist)
  const ensureMicPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const g = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    return g === PermissionsAndroid.RESULTS.GRANTED;
  };

  const startRecording = async () => {
    const ok = await ensureMicPermission();
    if (!ok) return;

    // Inicializa SIEMPRE antes de empezar
    const wavFile = `replica_${Date.now()}.wav`;
    AudioRecord.init({
      sampleRate: 16000,   // recomendado para ASR
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,      // ANDROID: VOICE_RECOGNITION
      wavFile,             // archivo de salida
    });

    await AudioRecord.start();

    finishedRef.current = false;
    setSeconds(0);
    setIsRecording(true);
  };

  const stopAndConfirm = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    const uri = await AudioRecord.stop(); // path del .wav creado en init
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    navigation.navigate('ReplicacionScreenSure', {
      audio: { uri, durationSec: seconds, createdAt: Date.now() },
    });
  };

  const toggleRecord = () => {
    if (isRecording) {
      // Detener → abrir modal de confirmación con el archivo grabado
      stopAndConfirm();
    } else {
      startRecording();
    }
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Header title="Replicación de Voz" onInfoPress={() => navigation.navigate('Informacion')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>1. Reconocimiento de voz</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.bold}>Graba repitiendo las frases de entrenamiento</Text>. Puedes
          tomar el tiempo que necesites y detener cuando estés listo/a.
        </Text>

        <View style={styles.whiteBox} />

        <View style={styles.micArea}>
          <Pressable
            onPress={toggleRecord}
            android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
            style={({ pressed }) => [
              styles.micButton,
              isRecording && styles.micButtonActive,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={28} color="#fff" />
          </Pressable>
          <Text style={styles.hint}>
            {isRecording ? (
              <>
                <Text style={styles.bold}>Grabando</Text> · {mmss(seconds)}
              </>
            ) : (
              <>
                <Text style={styles.bold}>Presiona</Text> para grabar
              </>
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xl * 2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  subtitle: { color: colors.text, opacity: 0.9, lineHeight: 20, marginBottom: spacing.lg, textAlign: 'center' },
  bold: { fontWeight: '700' },
  whiteBox: {
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card ?? '#FFFFFF',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  micArea: { alignItems: 'center' },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  micButtonActive: { backgroundColor: colors.primary },
  hint: { marginTop: spacing.sm, color: colors.text, opacity: 0.8 },
});
