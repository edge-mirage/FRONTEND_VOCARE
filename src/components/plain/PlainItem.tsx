import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  chevron?: boolean;
  disabled?: boolean;
  testID?: string;
};

export default function PlainItem({
  title, subtitle, onPress, right, chevron = true, disabled, testID,
}: Props) {
  const pressable = !!onPress && !disabled;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!pressable}
      android_ripple={pressable ? { color: 'rgba(0,0,0,0.06)' } : undefined}
      style={({ pressed }) => [styles.row, pressed && pressable && styles.rowPressed]}
      accessibilityRole={pressable ? 'button' : undefined}
      accessibilityState={{ disabled }}
    >
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>

      {right}
      {chevron && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    backgroundColor: '#fff',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPressed: { opacity: 0.96 },
  texts: { flex: 1, marginRight: spacing.md },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
});
