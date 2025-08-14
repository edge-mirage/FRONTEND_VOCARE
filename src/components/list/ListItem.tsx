// src/components/list/ListItem.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;               // para Switch / value / custom
  chevron?: boolean;                     // por defecto true si hay onPress
  showDivider?: boolean;                 // por defecto true
  disabled?: boolean;
  variant?: 'default' | 'danger';        // para “Cerrar sesión”
  testID?: string;
};

export default function ListItem({
  icon,
  title,
  subtitle,
  onPress,
  right,
  chevron,
  showDivider = true,
  disabled = false,
  variant = 'default',
  testID,
}: Props) {
  const isPressable = !!onPress && !disabled;
  const isDanger = variant === 'danger';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!isPressable}
      android_ripple={isPressable ? { color: 'rgba(0,0,0,0.06)' } : undefined}
      style={({ pressed }) => [
        styles.row,
        pressed && isPressable && styles.rowPressed,
        disabled && styles.rowDisabled,
      ]}
      accessibilityRole={isPressable ? 'button' : undefined}
      accessibilityState={{ disabled }}
    >
      {/* Icono izquierdo */}
      {icon ? (
        <View style={[styles.iconWrap, isDanger && styles.iconWrapDanger]}>
          <Ionicons
            name={icon}
            size={20}
            color={isDanger ? '#fff' : colors.primary}
          />
        </View>
      ) : (
        <View style={{ width: 36 }} />
      )}

      {/* Textos */}
      <View style={styles.texts}>
        <Text
          style={[styles.title, isDanger && styles.titleDanger]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right side */}
      {right}
      {chevron ?? isPressable ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDanger ? colors.text : colors.textMuted}
          style={{ marginLeft: spacing.md }}
        />
      ) : null}

      {/* Divider */}
      {showDivider && <View style={styles.divider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingVertical: spacing.lg,
    paddingRight: spacing.xl,
    paddingLeft: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowPressed: { opacity: 0.96 },
  rowDisabled: { opacity: 0.5 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.iconBg,
    marginRight: spacing.lg, marginLeft: spacing.xl,
  },
  iconWrapDanger: { backgroundColor: '#E879F9' /* morado claro/elige */ },
  texts: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  titleDanger: { color: '#B00020' },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  divider: {
    position: 'absolute',
    left: spacing.xl + 36 + spacing.lg, // alinear con textos (saltando el icono)
    right: spacing.xl,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
});
