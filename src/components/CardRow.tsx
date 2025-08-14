// src/components/CardRow.tsx
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {colors, spacing} from '@/theme';

type Variant = 'default' | 'primary';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress?: () => void;
  variant?: Variant;
};

export default function CardRow({
  icon,
  title,
  subtitle,
  onPress,
  variant = 'default',
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        isPrimary && styles.cardPrimary,
        pressed && {opacity: 0.9},
      ]}
    >
      <View style={[styles.iconWrap, isPrimary && styles.iconWrapPrimary]}>
        <Ionicons
          name={icon}
          size={20}
          color={isPrimary ? 'white' : colors.primary}
        />
      </View>

      <View style={styles.texts}>
        <Text style={[styles.title, isPrimary && styles.titlePrimary]}>
          {title}
        </Text>
        <Text
          style={[styles.subtitle, isPrimary && styles.subtitlePrimary]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={isPrimary ? 'white' : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  cardPrimary: {
    backgroundColor: colors.primary,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.iconBg,
  },
  iconWrapPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  texts: {flex: 1},
  title: {fontWeight: '700', fontSize: 16, color: colors.text, marginBottom: 2},
  titlePrimary: {color: 'white'},
  subtitle: {color: colors.textMuted, fontSize: 13, lineHeight: 18},
  subtitlePrimary: {color: 'rgba(255,255,255,0.9)'},
});
