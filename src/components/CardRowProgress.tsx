// src/components/CardRowProgress.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  progress: number;          // 0..100
  onPress?: () => void;
  barColor?: string;         // opcional (por defecto un verde agradable)
};

export default function CardRowProgress({
  icon,
  title,
  subtitle,
  progress,
  onPress,
  barColor = '#22c55e',
}: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>

        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: barColor }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.iconBg,
  },
  texts: { flex: 1 },
  title: { fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 2 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.iconBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
});
