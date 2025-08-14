// src/screens/Home/AppHomeScreen.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import { Image, StyleSheet, View } from 'react-native';
import { spacing } from '@/theme';
import { logos } from '@/assets/images';
import { ListItem, ListSection } from '@/components/list';
import { HomeStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function AppHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.logoWrap}>
        <Image source={logos.light} style={{ width: 120, height: 120 }} resizeMode="contain" />
      </View>

      <ListSection title="Home">
        <ListItem
          icon="person-outline"
          title="Mi cuenta"
          subtitle="Email, contraseña, teléfono…"
          onPress={() => {navigation.navigate('Cuenta')}}
        />
        <ListItem
          icon="settings-outline"
          title="Configuración"
          subtitle="Ajustes de la aplicación"
          onPress={() => {navigation.navigate('Configuracion')}}
        />
        <ListItem
          icon="globe-outline"
          title="Visita la página oficial"
          subtitle="Más información del proyecto en la web"
          onPress={() => {}}
        />
        <ListItem
          icon="log-out-outline"
          title="Cerrar sesión"
          subtitle="Salir de la cuenta"
          variant="danger"
          onPress={() => {}}
          showDivider={false}
        />
      </ListSection>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  logoWrap: { alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.md },
});