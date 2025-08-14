// src/navigation/ReplicacionStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ReplicacionStackParamList} from './types';
import ReplicacionesHomeScreen from '@/screens/Replicaciones/ReplicacionesHomeScreen';
import InformacionScreen from '@/screens/Replicaciones/InformacionScreen';
import ReplicacionesScreen from '@/screens/Replicaciones/ReplicacionScreen';
import VocesRegistradasScreen from '@/screens/Replicaciones/VocesRegistradasScreen';

const Stack = createNativeStackNavigator<ReplicacionStackParamList>();

export default function ReplicacionStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="ReplicacionHome" component={ReplicacionesHomeScreen} />
      <Stack.Screen name="Informacion" component={InformacionScreen} />
      <Stack.Screen name="Replicacion" component={ReplicacionesScreen} />
      <Stack.Screen name="VocesRegistradas" component={VocesRegistradasScreen} />
    </Stack.Navigator>
  );
}