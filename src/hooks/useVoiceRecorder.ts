// src/hooks/useVoiceRecorder.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

const ts = () => new Date().toISOString().replace(/[:.]/g, '-');
const stripScheme = (p?: string | null) => (p ? p.replace(/^file:\/\//, '') : null);
const addScheme   = (p?: string | null) => (p && !p.startsWith('file://') ? `file://${p}` : p || null);

// Directorio de staging: estable y visible para debug
const BASE_STAGING =
  Platform.OS === 'android' ? RNFS.ExternalCachesDirectoryPath : RNFS.DocumentDirectoryPath;
const STAGING_DIR = `${BASE_STAGING}/voice_staging`;

async function ensureDir(dir: string) {
  try {
    const exists = await RNFS.exists(dir);
    if (!exists) await RNFS.mkdir(dir);
  } catch (e) {
    console.warn('[REC] mkdir failed:', e);
  }
}

export function useVoiceRecorder() {
  const rec = useRef(new AudioRecorderPlayer()).current;

  // Estado de grabación
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds]     = useState(0);

  // Estado del clip guardado para revisión
  const [clipFsPath,  setClipFsPath]  = useState<string | null>(null); // SIN file:// (RNFS)
  const [clipRawPath, setClipRawPath] = useState<string | null>(null); // CON file:// (player / upload)
  const hasClip = !!clipFsPath;

  // Playback
  const [playing, setPlaying] = useState(false);

  // Guards internos
  const recListenerOn = useRef(false);
  const stoppingRef   = useRef(false);

  useEffect(() => {
    ensureDir(STAGING_DIR);
  }, []);

  const ensureMicPermission = useCallback(async () => {
    if (Platform.OS !== 'android') return true;
    const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return g === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  // ---- STOP playback
  const stopPlayback = useCallback(async () => {
    try { await rec.stopPlayer(); } catch {}
    try { rec.removePlayBackListener(); } catch {}
    setPlaying(false);
  }, [rec]);

  // ---- START recording
  const start = useCallback(async () => {
    if (recording) return;
    stoppingRef.current = false;

    await stopPlayback();
    if (recListenerOn.current) {
      try { rec.removeRecordBackListener(); } catch {}
      recListenerOn.current = false;
    }

    const ok = await ensureMicPermission();
    if (!ok) return;

    // Temporal interno
    const tmpName = `tmp_${ts()}.m4a`; // AAC en M4A (muy compatible)
    const tmpBase = Platform.OS === 'android' ? RNFS.CachesDirectoryPath : RNFS.DocumentDirectoryPath;
    const tmpPath = `${tmpBase}/${tmpName}`;

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      AVSampleRateKeyIOS: 16000,
    };

    setSeconds(0);
    setClipFsPath(null);
    setClipRawPath(null);

    await rec.startRecorder(tmpPath, audioSet);
    rec.addRecordBackListener((e) => {
      setSeconds(Math.floor((e?.currentPosition ?? 0) / 1000));
    });
    recListenerOn.current = true;
    setRecording(true);
  }, [ensureMicPermission, rec, recording, stopPlayback]);

  // ---- STOP recording → mover a STAGING y preparar rutas
  const stop = useCallback(async () => {
    if (!recording || stoppingRef.current) return null;
    stoppingRef.current = true;
  
    let rawTmp: string | null = null; // suele venir con file://
    try {
      rawTmp = await rec.stopRecorder();
    } finally {
      if (recListenerOn.current) {
        try { rec.removeRecordBackListener(); } catch {}
        recListenerOn.current = false;
      }
      setRecording(false);
    }
  
    const fsTmp = stripScheme(rawTmp);
    if (!fsTmp) return null;
  
    try {
      // simplemente usa el archivo que ya generó la lib
      const stat = await RNFS.stat(fsTmp);
      console.log('[REC] tmp ready:', fsTmp, 'size:', stat.size);
    
      setClipFsPath(fsTmp);          // sin scheme (para RNFS)
      setClipRawPath(addScheme(fsTmp)); // con scheme (para player / upload)
      return fsTmp;
    } catch (e) {
      console.warn('[REC] tmp stat failed:', fsTmp, e);
      return null;
    }
  }, [rec, recording]);

  // ---- TOGGLE play (usa SIEMPRE la ruta con file://)
  const togglePlay = useCallback(async () => {
    if (!clipRawPath) return;

    if (playing) {
      await stopPlayback();
    } else {
      try {
        await rec.startPlayer(clipRawPath); // con file://
        await rec.setVolume(1.0);
        setPlaying(true);
        rec.addPlayBackListener((e) => {
          if (e.currentPosition >= e.duration) {
            stopPlayback();
          }
        });
      } catch (e) {
        console.warn('[REC] startPlayer failed:', clipRawPath, e);
      }
    }
  }, [rec, clipRawPath, playing, stopPlayback]);

  // ---- DELETE clip (solo al aceptar/descartar)
  const deleteClip = useCallback(async () => {
    await stopPlayback();
    if (clipFsPath) {
      try {
        const exists = await RNFS.exists(clipFsPath);
        console.log('[REC] delete? exists=', exists, clipFsPath);
        if (exists) await RNFS.unlink(clipFsPath);
      } catch (e) {
        console.warn('[REC] unlink failed:', clipFsPath, e);
      }
    }
    setClipFsPath(null);
    setClipRawPath(null);
    setSeconds(0);
    stoppingRef.current = false;
  }, [clipFsPath, stopPlayback]);

  // ---- RESET total (salir de pantalla)
  const reset = useCallback(async () => {
    try { await rec.stopRecorder(); } catch {}
    if (recListenerOn.current) {
      try { rec.removeRecordBackListener(); } catch {}
      recListenerOn.current = false;
    }
    setRecording(false);
    await deleteClip();
  }, [deleteClip, rec]);

  // cleanup unmount
  useEffect(() => {
    return () => {
      (async () => {
        try { await rec.stopRecorder(); } catch {}
        try { rec.removeRecordBackListener(); } catch {}
        try { await stopPlayback(); } catch {}
      })();
    };
  }, [rec, stopPlayback]);

  // 👇 URI lista para subir (con file://). Si por alguna razón no hay raw, la generamos desde FS.
  const uploadUri = clipRawPath || (clipFsPath ? `file://${clipFsPath}` : null);

  return {
    // estado
    recording,
    seconds,
    hasClip,
    clipPath: clipFsPath,   // sin scheme (para RNFS / logs)
    uploadUri,              // CON scheme (para subir a la API)
    playing,

    // acciones
    start,
    stop,
    togglePlay,
    deleteClip,
    reset,
  };
}
