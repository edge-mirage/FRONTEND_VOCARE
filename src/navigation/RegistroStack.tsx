// src/navigation/RegistroStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegistroScreen from '@/screens/Registro/RegistroScreen'; // La crearás abajo

export type RegistroStackParamList = {
  Registro: undefined;
};

const Stack = createNativeStackNavigator<RegistroStackParamList>();

export default function RegistroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Registro" component={RegistroScreen} />
    </Stack.Navigator>
  );
}
