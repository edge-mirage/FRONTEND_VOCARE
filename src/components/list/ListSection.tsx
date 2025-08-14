import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing } from '@/theme';

type Props = ViewProps & {
  title?: string;
  children: React.ReactNode;
};

export default function ListSection({ title, style, children, ...rest }: Props) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.group}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { color: colors.primary, fontSize: 22, fontWeight: '700', marginBottom: spacing.md },
  group: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden', // para que los dividers no sobresalgan
  },
});
