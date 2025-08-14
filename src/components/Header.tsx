// src/components/Header.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Image, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/theme';
import { logos } from '@/assets/images';
import { RootStackParamList } from '@/navigation/types';

type Props = {
  title: string;
  onInfoPress?: () => void;
  size?: 'normal' | 'tall';
  elevated?: boolean;           // ← NUEVO: sombra on/off
};

export default function Header({ title, onInfoPress, size = 'tall', elevated = true }: Props) {
  const scheme = useColorScheme();
  const logoSrc = scheme === 'dark' ? logos.light : logos.dark;
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const isTall = size === 'tall';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={[
        styles.container,
        isTall && styles.containerTall,
        elevated && styles.shadow,           // ← aplica sombra
      ]}>
        <View style={styles.left}>
          <Image source={logoSrc} style={[styles.logo, isTall && styles.logoTall]} resizeMode="contain" />
        </View>

        <Text style={[styles.title, isTall && styles.titleTall]} numberOfLines={1}>{title}</Text>

        <View style={styles.actions}>
          <Pressable onPress={() => nav.navigate('HomeStack')} style={styles.actionBtn}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
          <Pressable onPress={onInfoPress} hitSlop={10} style={styles.actionBtn}>
            <Ionicons name="information-circle-outline" size={30} color="white" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.primary },
  container: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Sombra iOS + Android
  shadow: {
    elevation: 6,                           // Android
    shadowColor: '#000',                    // iOS
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  containerTall: { paddingBottom: spacing.md, paddingTop: spacing.md },
  left: { marginRight: spacing.md },
  actions: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' },
  actionBtn: { marginLeft: spacing.md },
  title: { color: 'white', fontSize: 22, fontWeight: '700', flexShrink: 1 },
  titleTall: { fontSize: 24 },
  logo: { width: 28, height: 28 },
  logoTall: { width: 36, height: 36 },
});
