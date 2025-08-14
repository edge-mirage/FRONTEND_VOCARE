// src/screens/Home/CuentaScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';
import Header from '@/components/Header';
import {colors, spacing} from '@/theme';

export default function CuentaScreen() {
  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title="Mi Cuenta" />
      <View style={{padding: spacing.xl}}>
        <Text>Aquí va a ir la información de la cuenta y esas cosas</Text>
      </View>
    </View>
  );
}