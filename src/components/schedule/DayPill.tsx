// src/components/dates/DayPill.tsx
import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import {colors, spacing} from '@/theme';

type Props = { label: string; selected: boolean; onToggle: () => void };
export default function DayPill({label, selected, onToggle}: Props) {
  return (
    <Pressable onPress={onToggle} style={[styles.pill, selected && styles.pillOn]}>
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  pill: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 2, borderColor: colors.primary, marginHorizontal: 4,
  },
  pillOn: { backgroundColor: colors.primary },
  text: { color: colors.primary, fontWeight: '700' },
  textOn: { color: '#fff' },
});
