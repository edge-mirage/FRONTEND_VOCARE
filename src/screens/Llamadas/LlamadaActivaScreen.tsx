// src/screens/Llamadas/LlamadaActivaScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';
import type { LlamadaStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'LlamadaActiva'>;
type Rt  = RouteProp<LlamadaStackParamList, 'LlamadaActiva'>;

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function LlamadaActivaScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const number = params?.number ?? '+ 56 9 7534 7402';

  const [seconds, setSeconds] = useState(0);
  const [speaker, setSpeaker] = useState(false);
  const [muted, setMuted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetToCallsHomeAndExit = () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'LlamadaHome' }] })
    );
    navigation.getParent()?.navigate('LlamadasTab');
    if (Platform.OS === 'android') setTimeout(() => BackHandler.exitApp(), 30);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      resetToCallsHomeAndExit();
      return true;
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sub.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
        <Text style={styles.number}>{number}</Text>
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

        <Pressable style={styles.smallBtn} onPress={() => setSpeaker(s => !s)}>
          <Ionicons name={speaker ? 'volume-high' : 'volume-mute'} size={22} color={colors.primary} />
        </Pressable>

        <Pressable style={styles.smallBtn} onPress={() => setMuted(m => !m)}>
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
