import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'ReconocimientoVoz'>;

export default function ReconocimientoVozScreen() {
  const navigation = useNavigation<Nav>();
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // contador simple hasta 45 s (placeholder de lógica real)
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 45) {
            setIsRecording(false);
            return 45;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleRecord = () => {
    // TODO: pedir permisos de mic y enganchar tu grabador real
    if (seconds >= 45) {
      setSeconds(0); // reinicia si ya llegó al límite
    }
    setIsRecording(v => !v);
  };

  const mmss = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Header title="Replicación de Voz" onInfoPress={() => navigation.navigate('Informacion')} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>1. Reconocimiento de voz</Text>

        <Text style={styles.subtitle}>
          <Text style={styles.bold}>Graba un audio de 45 segundos</Text> repitiendo las
          siguientes instrucciones para hacer el reconocimiento inicial de tu voz.
        </Text>

        {/* Caja blanca grande (placeholder para script / ondas / texto) */}
        <View style={styles.whiteBox} />

        {/* Botón de micrófono */}
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

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.text,
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  bold: { fontWeight: '700' },

  whiteBox: {
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card ?? '#FFFFFF',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xl,
    // sombra sutil
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
  micButtonActive: {
    backgroundColor: colors.primary, // puedes oscurecer si quieres feedback
  },
  hint: {
    marginTop: spacing.sm,
    color: colors.text,
    opacity: 0.8,
  },
});
