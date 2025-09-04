// src/components/RecordMicButton.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  onPress?: () => void;
  recording?: boolean;           // opcional, por si luego quieres togglear estado
  label?: string;                // por defecto: "Presiona para grabar"
};

export default function RecordMicButton({ onPress, recording = false, label }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          recording && styles.buttonRecording,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <Ionicons name="mic" size={28} color="#fff" />
      </Pressable>

      <Text style={styles.caption}>
        <Text style={{ fontWeight: '800' }}>{label ?? 'Presiona'}</Text>
        {label ? '' : ' para grabar'}
      </Text>
    </View>
  );
}

const BTN_SIZE = 76;

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  button: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // sombra
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  buttonRecording: {
    backgroundColor: '#6d28d9', // un púrpura más intenso
  },
  caption: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
