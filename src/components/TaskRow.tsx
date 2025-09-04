// src/components/TaskRow.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  done?: boolean;       // 0/1 -> false/true
  onPress?: () => void;
};

export default function TaskRow({ title, subtitle, done = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
      </View>

      <View style={styles.trailing}>
        {/* “ticket” visual */}
        {done ? (
          <View style={styles.checkDone}>
            <Ionicons name="checkmark" size={18} color="#111827" />
          </View>
        ) : (
          <View style={styles.checkTodo} />
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

const CHECK_SIZE = 28;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  texts: { flex: 1 },
  title: { fontWeight: '800', fontSize: 15, color: colors.text, marginBottom: 2 },
  subtitle: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkTodo: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  checkDone: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: 14,
    backgroundColor: '#BBF7D0', // verde claro tipo mock
    alignItems: 'center',
    justifyContent: 'center',
  },
});
