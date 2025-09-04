// src/components/RecordingBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing } from '@/theme';

type Props = {
  seconds: number;
  onStop: () => void;
};

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function RecordingBar({ seconds, onStop }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.dot} />
      <Text style={styles.time}>{fmt(seconds)}</Text>
      <View style={{ flex: 1 }} />
      <Pressable onPress={onStop} style={styles.stopBtn}>
        <View style={styles.stopIcon} />
        <Text style={styles.stopText}>Detener</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginRight: spacing.md,
  },
  time: { color: colors.text, fontWeight: '700' },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  stopIcon: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  stopText: { color: '#fff', fontWeight: '800' },
});
