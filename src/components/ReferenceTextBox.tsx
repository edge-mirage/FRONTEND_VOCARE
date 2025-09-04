// src/components/ReferenceTextBox.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export default function ReferenceTextBox({ text }: { text: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#ede9fe', // lila suave
    borderRadius: 14,
    padding: spacing.lg,
  },
  text: { color: colors.text, lineHeight: 22 },
});
