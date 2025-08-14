// src/navigation/HomeStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeStackParamList} from './types';
import AppHomeScreen from '@/screens/Home/AppHomeScreen';
import CuentaScreen from '@/screens/Home/CuentaScreen';
import ConfiguracionScreen from '@/screens/Home/ConfiguracionScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="AppHome" component={AppHomeScreen} />
      <Stack.Screen name="Cuenta" component={CuentaScreen} />
      <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
    </Stack.Navigator>
  );
}