// src/navigation/LlamadaStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {LlamadaStackParamList} from './types';
import LlamadasHomeScreen from '@/screens/Llamadas/LlamadasHomeScreen';
import LlamadaInstantaneaScreen from '@/screens/Llamadas/LlamadaInstantaneaScreen';
import LlamadaRapidaScreen from '@/screens/Llamadas/LlamadaRapidaScreen';
import AgendarLlamadasScreen from '@/screens/Llamadas/AgendarLlamadasScreen';
import ContextosScreen from '@/screens/Llamadas/ContextosScreen';

const Stack = createNativeStackNavigator<LlamadaStackParamList>();

export default function LlamadaStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="LlamadaHome" component={LlamadasHomeScreen} />
      <Stack.Screen name="LlamadaInstantanea" component={LlamadaInstantaneaScreen} />
      <Stack.Screen name="LlamadaRapida" component={LlamadaRapidaScreen} />
      <Stack.Screen name="AgendarLlamada" component={AgendarLlamadasScreen} />
      <Stack.Screen name="ContextosDeLlamada" component={ContextosScreen} />
    </Stack.Navigator>
  );
}