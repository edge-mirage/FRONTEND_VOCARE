// src/screens/Llamadas/LlamadaInstantaneaScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, BackHandler, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';
import type { LlamadaStackParamList } from '@/navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'LlamadaInstantanea'>;
type Rt  = RouteProp<LlamadaStackParamList, 'LlamadaInstantanea'>;

export default function LlamadaInstantaneaScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const insets = useSafeAreaInsets();
  const number = params?.number ?? '+ 56 9 7534 7402';
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetToCallsHomeAndExit = () => {
    // 1) resetea el stack de Llamadas a su pantalla inicial
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'LlamadaHome' }] })
    );
    // 2) asegura que estemos en la pestaña Llamadas
    navigation.getParent()?.navigate('LlamadasTab');

    // 3) cierra la app en Android (en iOS no está permitido)
    if (Platform.OS === 'android') {
      setTimeout(() => BackHandler.exitApp(), 30); // da tiempo a aplicar el reset
    }
  };

  useEffect(() => {
    // autocortar a los 20s
    timerRef.current = setTimeout(resetToCallsHomeAndExit, 20_000);

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      resetToCallsHomeAndExit();
      return true;
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      sub.remove();
    };
  }, []);

  const answer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigation.replace('LlamadaActiva', { number });
  };

  const decline = () => resetToCallsHomeAndExit();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Llamada entrante</Text>
      <Text style={styles.number}>{number}</Text>

      <View style={{ height: 28 }} />

      <View style={styles.avatar}>
        <Ionicons name="person" size={80} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }} />

      <View
        style={[
          styles.actions,
          { bottom: insets.bottom + 80 },
        ]}
      >
        <Pressable style={[styles.roundBtn, styles.decline]} onPress={decline}>
          <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </Pressable>
        <Pressable style={[styles.roundBtn, styles.answer]} onPress={answer}>
          <Ionicons name="call" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBEAF7', alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.xl },
  title: { color: colors.textMuted, marginBottom: 6, fontWeight: '600' },
  number: { color: colors.text, fontWeight: '800', fontSize: 20 },
  avatar: {
    width: 160, height: 160, borderRadius: 80,
    borderWidth: 10, borderColor: colors.primary, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    // bottom se setea en runtime con el safe-area
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  roundBtn: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  decline: { backgroundColor: '#EF4444' },
  answer:  { backgroundColor: '#22C55E' },
});
