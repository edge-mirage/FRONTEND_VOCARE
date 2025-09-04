// src/components/RecordMicButton.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = { onPress?: () => void };

export default function RecordMicButton({ onPress }: Props) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={onPress} style={styles.btn}>
        <Ionicons name="mic" size={28} color="#fff" />
      </Pressable>
      <Text style={styles.caption}>
        <Text style={{ fontWeight: '800' }}>Presiona</Text> para grabar
      </Text>
    </View>
  );
}

const SIZE = 80;

const styles = StyleSheet.create({
  btn: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  caption: { marginTop: 8, color: colors.textMuted, fontSize: 13 },
});
