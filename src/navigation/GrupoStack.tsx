// src/navigation/GrupoStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GrupoStackParamList} from './types';
import TemporalScreen from '@/screens/GrupoFamiliar/TemporalScreen';
import GrupoFamiliarHomeScreen from '@/screens/GrupoFamiliar/GrupoFamiliarHomeScreen';


const Stack = createNativeStackNavigator<GrupoStackParamList>();

export default function GrupoStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="GrupoFamiliarHome" component={GrupoFamiliarHomeScreen} />
      <Stack.Screen name="OPCION1" component={TemporalScreen} />
      <Stack.Screen name="OPCION2" component={TemporalScreen} />
    </Stack.Navigator>
  );
}