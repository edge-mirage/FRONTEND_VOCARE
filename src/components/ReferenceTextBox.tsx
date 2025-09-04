// src/components/ReferenceTextBox.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

type Props = { text: string };

export default function ReferenceTextBox({ text }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.iconBg, // gris suave del tema
    borderRadius: 10,
    padding: spacing.md,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
