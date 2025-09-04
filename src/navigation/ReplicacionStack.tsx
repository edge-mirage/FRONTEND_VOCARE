// src/navigation/ReplicacionStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReplicacionStackParamList } from './types';

import ReplicacionesHomeScreen from '@/screens/Replicaciones/ReplicacionesHomeScreen';
import InformacionScreen from '@/screens/Replicaciones/InformacionScreen';
import ReplicacionScreen from '@/screens/Replicaciones/ReplicacionScreen'; // <- nombre alineado
import VocesRegistradasScreen from '@/screens/Replicaciones/VocesRegistradasScreen';
import TareaLecturaScreen from '@/screens/Replicaciones/TareaLecturaScreen';



const Stack = createNativeStackNavigator<ReplicacionStackParamList>();

export default function ReplicacionStack() {
  return (
    <Stack.Navigator
      initialRouteName="ReplicacionHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="ReplicacionHome" component={ReplicacionesHomeScreen} />
      <Stack.Screen name="Informacion" component={InformacionScreen} />
      <Stack.Screen name="Replicacion" component={ReplicacionScreen} />
      <Stack.Screen name="VocesRegistradas" component={VocesRegistradasScreen} />
      <Stack.Screen name="TareaLectura" component={TareaLecturaScreen} />



    </Stack.Navigator>
  );
}
