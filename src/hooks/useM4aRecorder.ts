import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import { PERMISSIONS, check, request, RESULTS } from 'react-native-permissions';

const ts = () => new Date().toISOString().replace(/[:.]/g, '-');

export function useM4aRecorder() {
  const rec = useRef(new AudioRecorderPlayer()).current;

  const [recording, setRecording] = useState(false);
  const [playing,   setPlaying]   = useState(false);
  const [timer,     setTimer]     = useState('00:00');
  const [fileUri,   setFileUri]   = useState<string | null>(null);

  const ensureMicPermission = useCallback(async () => {
    const perm = Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
    const c = await check(perm);
    if (c === RESULTS.GRANTED) return true;
    const r = await request(perm);
    return r === RESULTS.GRANTED;
  }, []);

  const start = useCallback(async () => {
    const ok = await ensureMicPermission();
    if (!ok || recording) return;

    const outPath = `${RNFS.DocumentDirectoryPath}/vocare_${Date.now()}_${ts()}.m4a`;
    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 1,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    setTimer('00:00');
    setFileUri(null);

    await rec.startRecorder(outPath, audioSet);

    rec.addRecordBackListener((e) => {
      const sec = Math.floor((e.currentPosition ?? 0) / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, '0');
      const ss = String(sec % 60).padStart(2, '0');
      setTimer(`${mm}:${ss}`);
    });

    setRecording(true);
  }, [ensureMicPermission, rec, recording]);

  const stop = useCallback(async () => {
    if (!recording) return null;
    let p = await rec.stopRecorder();
    try { rec.removeRecordBackListener(); } catch {}
    setRecording(false);

    if (p && !p.startsWith('file://')) p = `file://${p}`;
    setFileUri(p || null);
    return p || null;
  }, [rec, recording]);

  const togglePlay = useCallback(async () => {
    if (!fileUri) return;
    if (!playing) {
      await rec.startPlayer(fileUri);
      rec.addPlayBackListener((e) => {
        if ((e.duration ?? 0) > 0 && e.currentPosition >= (e.duration ?? 0)) {
          setPlaying(false);
          rec.stopPlayer().catch(() => {});
          try { rec.removePlayBackListener(); } catch {}
        }
      });
      setPlaying(true);
    } else {
      await rec.stopPlayer();
      try { rec.removePlayBackListener(); } catch {}
      setPlaying(false);
    }
  }, [rec, fileUri, playing]);

  const deleteFile = useCallback(async () => {
    if (!fileUri) return;
    const fsPath = fileUri.replace('file://', '');
    try { const ok = await RNFS.exists(fsPath); if (ok) await RNFS.unlink(fsPath); } catch {}
    setFileUri(null);
  }, [fileUri]);

  return {
    // estado
    recording, playing, timer, fileUri,
    // acciones
    start, stop, togglePlay, deleteFile
  };
}
