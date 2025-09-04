// src/hooks/useWavFileRecorder.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import AudioRecord from 'react-native-audio-record';

const ts = () => new Date().toISOString().replace(/[:.]/g, '-');
const strip = (u?: string | null) => (u ? u.replace(/^file:\/\//, '') : '');
const add   = (p: string) => (p.startsWith('file://') ? p : `file://${p}`);

const STAGING_DIR =
  Platform.OS === 'android' ? RNFS.CachesDirectoryPath : RNFS.DocumentDirectoryPath;

async function ensureDir(dir: string) {
  try {
    if (!(await RNFS.exists(dir))) await RNFS.mkdir(dir);
  } catch {}
}

export function useWavFileRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds]     = useState(0);
  const [uploadUri, setUploadUri] = useState<string | null>(null); // file://…

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wavPathRef = useRef<string | null>(null); // sin scheme (fs)

  // permisos mic (Android)
  const ensureMicPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return g === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  useEffect(() => {
    ensureDir(`${STAGING_DIR}/voice_staging`).catch(() => {});
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, []);

  const start = useCallback(async () => {
    if (recording) return;

    const granted = await ensureMicPermission();
    if (!granted) return;

    const dir = `${STAGING_DIR}/voice_staging`;
    await ensureDir(dir);

    const wavFs = `${dir}/rec_${ts()}.wav`; // SIN scheme
    wavPathRef.current = wavFs;

    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: wavFs,                           // ← la lib escribirá aquí
      ...(Platform.OS === 'android' ? { audioSource: 6 } : {}),
    });

    setUploadUri(null);
    setSeconds(0);
    setRecording(true);

    // cronómetro simple
    if (timerRef.current) { clearInterval(timerRef.current); }
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    try { AudioRecord.start(); } catch {}
  }, [ensureMicPermission, recording]);

  const stop = useCallback(async () => {
    if (!recording) return null;

    try { await AudioRecord.stop(); } catch {}
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    const fsPath = wavPathRef.current || '';
    wavPathRef.current = null;

    if (!fsPath) return null;

    // validar que realmente exista y tenga tamaño > header WAV (44 bytes)
    try {
      const exists = await RNFS.exists(fsPath);
      if (!exists) return null;
      const st = await RNFS.stat(fsPath);
      if (!st.size || Number(st.size) <= 44) return null;
    } catch {
      return null;
    }

    const uri = add(fsPath);     // file://…
    setUploadUri(uri);
    return uri;
  }, [recording]);

  const deleteClip = useCallback(async () => {
    const p = strip(uploadUri || wavPathRef.current || '');
    if (p) {
      try { const ex = await RNFS.exists(p); if (ex) await RNFS.unlink(p); } catch {}
    }
    setUploadUri(null);
    wavPathRef.current = null;
    setSeconds(0);
  }, [uploadUri]);

  const reset = useCallback(async () => {
    try { await AudioRecord.stop(); } catch {}
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecording(false);
    await deleteClip();
  }, [deleteClip]);

  return {
    recording,
    seconds,
    uploadUri,   // file://… listo para subir
    start,
    stop,
    deleteClip,
    reset,
  };
}
