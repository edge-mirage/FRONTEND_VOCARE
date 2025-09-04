// src/screens/VoiceTaskScreen.tsx
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import { uploadAudioTask, UploadResult } from '@/services/uploadAudioTask';

const DEFAULT_QUESTION = 1;

const VoiceTaskScreen: React.FC = () => {
  const recorder = useRef(new AudioRecorderPlayer()).current;

  const [recording, setRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [timer, setTimer] = useState<string>('00:00');

  // Permisos micrófono
  const ensureMicPermission = useCallback(async () => {
    const perm =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const current = await check(perm);
    if (current === RESULTS.GRANTED) return true;

    const req = await request(perm);
    if (req !== RESULTS.GRANTED) {
      Alert.alert('Permiso requerido', 'Debes otorgar acceso al micrófono para grabar audio.');
      return false;
    }
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    const ok = await ensureMicPermission();
    if (!ok) return;

    try {
      // Ruta de salida en el directorio de la app
      const path = `${RNFS.DocumentDirectoryPath}/vocare_tarea_${DEFAULT_QUESTION}_${Date.now()}.m4a`;

      // Configuración de audio (opcional; deja defaults si quieres)
      const audioSet: AudioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 1,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      setResult(null);
      setRecordedUri(null);
      setTimer('00:00');

      await recorder.startRecorder(path, audioSet);

      recorder.addRecordBackListener((e) => {
        // e.currentPosition viene en ms
        const sec = Math.floor((e.currentPosition ?? 0) / 1000);
        const mm = String(Math.floor(sec / 60)).padStart(2, '0');
        const ss = String(sec % 60).padStart(2, '0');
        setTimer(`${mm}:${ss}`);
      });

      setRecording(true);
    } catch (err: any) {
      console.error('Error startRecording:', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
    }
  }, [ensureMicPermission, recorder]);

  const stopRecording = useCallback(async () => {
    try {
      const path = await recorder.stopRecorder();
      recorder.removeRecordBackListener();

      let uri = path;
      if (uri && !uri.startsWith('file://')) {
        // iOS a veces entrega ruta sin prefijo
        uri = `file://${uri}`;
      }

      setRecordedUri(uri);
      setRecording(false);
    } catch (err) {
      console.error('Error stopRecording:', err);
      setRecording(false);
      Alert.alert('Error', 'No se pudo detener la grabación.');
    }
  }, [recorder]);

  const togglePlay = useCallback(async () => {
    if (!recordedUri) return;
    try {
      if (!playing) {
        await recorder.startPlayer(recordedUri);
        recorder.addPlayBackListener((e) => {
          if (e.currentPosition >= (e.duration ?? 0)) {
            setPlaying(false);
            recorder.stopPlayer().catch(() => {});
          }
        });
        setPlaying(true);
      } else {
        await recorder.stopPlayer();
        setPlaying(false);
      }
    } catch (err) {
      console.error('Error togglePlay:', err);
      Alert.alert('Error', 'No se pudo reproducir el audio.');
      setPlaying(false);
    }
  }, [playing, recordedUri, recorder]);

  const handleUpload = async () => {
    if (!recordedUri) {
      Alert.alert('Sin audio', 'Primero graba un audio.');
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadAudioTask(recordedUri, DEFAULT_QUESTION);
      setResult(res);
      const msg = [
        `✅ match: ${res.match ? 'sí' : 'no'}`,
        `🎯 similarity: ${res.similarity}`,
        res.audio_url ? `🔗 audio_url: ${res.audio_url}` : null,
        `🧩 task_updated: ${res.task_updated}`,
      ].filter(Boolean).join('\n');
      Alert.alert('Respuesta del servidor', msg);
    } catch (err: any) {
      console.error('Upload error:', err);
      Alert.alert('Error al subir', err?.message ?? 'Fallo inesperado al subir el audio.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tarea de voz — Pregunta {DEFAULT_QUESTION}</Text>

      <View style={styles.card}>
        <Text style={styles.timerLabel}>Grabación</Text>
        <Text style={styles.timer}>{timer}</Text>

        {!recording ? (
          <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={startRecording}>
            <Text style={styles.btnText}>🎙️ Grabar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={stopRecording}>
            <Text style={styles.btnText}>⏹️ Detener</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, recordedUri ? styles.btnSecondary : styles.btnDisabled]}
          onPress={togglePlay}
          disabled={!recordedUri}
        >
          <Text style={styles.btnText}>{playing ? '⏸️ Pausar' : '▶️ Reproducir'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, recordedUri ? styles.btnSuccess : styles.btnDisabled]}
          onPress={handleUpload}
          disabled={!recordedUri || uploading}
        >
          {uploading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.btnText}>⬆️ Subir al backend</Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Resultado</Text>
          <Text>match: {result.match ? 'sí' : 'no'}</Text>
          <Text>similarity: {result.similarity}</Text>
          <Text>task_updated: {result.task_updated ? 'sí' : 'no'}</Text>
          {result.audio_url ? <Text>audio_url: {result.audio_url}</Text> : null}
          <Text>tasks_completed: [{result.tasks_completed.join(', ')}]</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VoiceTaskScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0b0b0c' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 12 },
  card: {
    backgroundColor: '#151517',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  timerLabel: { color: '#9aa0a6', fontSize: 14 },
  timer: { color: '#fff', fontSize: 28, fontVariant: ['tabular-nums'] },
  btn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { backgroundColor: '#334155' },
  btnSuccess: { backgroundColor: '#16a34a' },
  btnDanger: { backgroundColor: '#dc2626' },
  btnDisabled: { backgroundColor: '#3f3f46' },
  result: {
    marginTop: 16,
    backgroundColor: '#111113',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
