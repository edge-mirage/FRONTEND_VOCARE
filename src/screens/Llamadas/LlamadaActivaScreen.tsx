// src/screens/Llamadas/LlamadaActivaScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';
import type { LlamadaStackParamList } from '@/navigation/types';
import { useMicPermissionOnLaunch } from '@/permissions/useMicPermission';

import InCallManager from 'react-native-incall-manager';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';

type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'LlamadaActiva'>;
type Rt  = RouteProp<LlamadaStackParamList, 'LlamadaActiva'>;

// ⬅️ pon la IP de tu PC accesible desde el dispositivo
const WS_BASE = Platform.select({
  android: 'ws://10.250.108.210:8000',
  ios:     'ws://10.250.108.210:8000',
})!;
const WS_PATH = Platform.select({
  android: '/calls/ws/audio', // si realmente tienes /calls2 para Android
  ios:     '/calls/ws/audio',
})!;
const buildWsUrl = (pacientId: number, contextItemId: number) => {
  const qs = `pacient_id=${encodeURIComponent(String(pacientId))}&id_contexto=${encodeURIComponent(String(contextItemId))}`;
  return `${WS_BASE}${WS_PATH}?${qs}`;
};

const TMP_WAV_PATH = `${RNFS.CachesDirectoryPath}/call_tmp.wav`;

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LlamadaActivaScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const who = params?.voiceName ?? 'Voz replicada';
  const pacientId = params?.pacientId;
  const contextItemId = params?.contextItemId;

  const [seconds, setSeconds] = useState(0);
  const [speaker, setSpeaker] = useState(false);
  const [muted, setMuted] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recStartedRef = useRef(false);
  const pausedWhilePlayingRef = useRef(false);
  const mutedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { Sound.setCategory('Playback'); }, []);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // permisos mic
  const { ensureMicPermission, micGranted } = useMicPermissionOnLaunch();

  // cronómetro UI
  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  // grabación y envío (equivalente al cliente Python)
  function startRecording() {
    if (recStartedRef.current) return;

    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: TMP_WAV_PATH,
      ...(Platform.OS === 'android' ? { audioSource: 6 } : {}),
    });

    let acc = Buffer.alloc(0);
    let lastFlush = Date.now();

    AudioRecord.on('data', (base64: string) => {
      if (pausedWhilePlayingRef.current || mutedRef.current) return;
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const chunk = Buffer.from(base64, 'base64'); // PCM int16 mono
      acc = Buffer.concat([acc, chunk]);

      const enoughBytes = acc.length >= 32000;      // ~1s @ 16kHz * 16-bit mono
      const enoughTime  = Date.now() - lastFlush >= 1000;

      if (enoughBytes || enoughTime) {
        try { ws.send(acc); } catch {}
        acc = Buffer.alloc(0);
        lastFlush = Date.now();
      }
    });

    AudioRecord.start();
    recStartedRef.current = true;
  }

  async function stopRecording() {
    try { await AudioRecord.stop(); } catch {}
    recStartedRef.current = false;
    RNFS.unlink(TMP_WAV_PATH).catch(() => {});
  }

  // conexión WS (pausa → reproduce → reanuda)
  function connectWS() {
    // Construimos la URL con las IDs que exige el backend
    const url = buildWsUrl(pacientId, contextItemId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = async () => {
      InCallManager.start({ media: 'audio' });
      InCallManager.setSpeakerphoneOn(false);
      
      const ok = await ensureMicPermission(); // solo chequea / reintenta si hizo falta
      if (ok) startRecording();
    };

    ws.onmessage = async (evt: any) => {
      // llega mp3 del backend
      pausedWhilePlayingRef.current = true;
      await stopRecording();

      const filePath = `${RNFS.CachesDirectoryPath}/resp_${Date.now()}.mp3`;
      try {
        if (typeof evt.data === 'string') {
          await RNFS.writeFile(filePath, evt.data, 'base64');
        } else {
          const ab: ArrayBuffer = (evt.data as any);
          const u8 = new Uint8Array(ab);
          await RNFS.writeFile(filePath, Buffer.from(u8).toString('base64'), 'base64');
        }
      } catch {
        pausedWhilePlayingRef.current = false;
        startRecording();
        return;
      }

      const s = new Sound(filePath, '', (err) => {
        if (err) {
          pausedWhilePlayingRef.current = false;
          startRecording();
          return;
        }
        s.setVolume(1.0);
        s.play(() => {
          s.release();
          RNFS.unlink(filePath).catch(() => {});
          pausedWhilePlayingRef.current = false;
          startRecording();
        });
      });
    };

    ws.onerror = () => { /* opcional: log/alert */ };
    ws.onclose  = () => { wsRef.current = null; };
  }

  // acciones UI
  function toggleSpeaker() {
    setSpeaker(prev => {
      const next = !prev;
      InCallManager.setSpeakerphoneOn(next);
      return next;
    });
  }
  function toggleMute() { setMuted(m => !m); }

  async function cleanupAll() {
    await stopRecording();
    if (wsRef.current) { try { wsRef.current.close(); } catch {}; wsRef.current = null; }
    InCallManager.setSpeakerphoneOn(false);
    InCallManager.stop();
    stopTimer();
  }

  const resetToCallsHomeAndExit = () => {
    try { AudioRecord.stop(); } catch {}
    RNFS.unlink(TMP_WAV_PATH).catch(() => {});
    cleanupAll();
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'LlamadaHome' }] }));
    navigation.getParent()?.navigate('LlamadasTab');
    if (Platform.OS === 'android') setTimeout(() => BackHandler.exitApp(), 30);
  };

  // ciclo de vida
  useEffect(() => {
    startTimer();
    connectWS();
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { resetToCallsHomeAndExit(); return true; });
    return () => {
      try { AudioRecord.stop(); } catch {}
      RNFS.unlink(TMP_WAV_PATH).catch(() => {});
      sub.remove();
      cleanupAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
        <Text style={styles.number}>{who}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} />
          <Text style={styles.subtitle}>  Cifrado de extremo a extremo</Text>
        </View>
      </View>

      <View style={{ height: 28 }} />

      <View style={styles.avatar}>
        <Ionicons name="person" size={80} color={colors.primary} />
      </View>

      <Text style={styles.timer}>{fmt(seconds)}</Text>

      <View style={styles.bottomBar}>
        <Pressable style={styles.smallBtn}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.smallBtn} onPress={toggleSpeaker}>
          <Ionicons name={speaker ? 'volume-high' : 'volume-mute'} size={22} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.smallBtn} onPress={toggleMute}>
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={22} color={colors.primary} />
        </Pressable>
        <Pressable style={[styles.smallBtn, styles.hang]} onPress={resetToCallsHomeAndExit}>
          <Ionicons name="call" size={20} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBEAF7', alignItems: 'center' },
  number: { color: colors.text, fontWeight: '800', fontSize: 18 },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  avatar: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 10, borderColor: colors.primary, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  timer: { marginTop: spacing.md, fontWeight: '800', color: colors.primary, fontSize: 18 },
  bottomBar: {
    position: 'absolute',
    left: spacing.xl, right: spacing.xl, bottom: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  smallBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  hang: { backgroundColor: '#EF4444' },
});
