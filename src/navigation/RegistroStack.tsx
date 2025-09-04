// src/navigation/RegistroStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RegistroStackParamList } from './types';

import RegistroScreen from '@/screens/Registro/RegistroScreen';
import RegistroCuidadorOne from '@/screens/Registro/RegistroCuidadorOne';
import RegistroDatosPaciente from '@/screens/Registro/RegistroDatosPaciente';
import RegistroSolicitaGUID from '@/screens/Registro/RegistroSolicitaGUID';
import RegistroSintomasPaciente from '@/screens/Registro/RegistroSintomasPaciente';
import RegistroSintomasEscala from '@/screens/Registro/RegistroSintomasEscala';
import RegistroListo from '@/screens/Registro/RegistroListo';

const Stack = createNativeStackNavigator<RegistroStackParamList>();

export default function RegistroStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RegistroScreen" component={RegistroScreen} />
      <Stack.Screen name="RegistroCuidadorOne" component={RegistroCuidadorOne} />
      <Stack.Screen name="RegistroDatosPaciente" component={RegistroDatosPaciente} />
      <Stack.Screen name="RegistroSolicitaGUID" component={RegistroSolicitaGUID} />
      <Stack.Screen name="RegistroSintomasPaciente" component={RegistroSintomasPaciente} />
      <Stack.Screen name="RegistroSintomasEscala" component={RegistroSintomasEscala} />
      <Stack.Screen name="RegistroListo" component={RegistroListo} />
    </Stack.Navigator>
  );
}
