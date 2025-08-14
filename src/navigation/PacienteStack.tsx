// src/navigation/PacienteStack.tsx
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {PacienteStackParamList} from './types';
import PacienteHomeScreen from '@/screens/Paciente/PacienteHomeScreen';
import PerfilPacienteScreen from '@/screens/Paciente/PerfilPacienteScreen';
import SintomasScreen from '@/screens/Paciente/SintomasScreen';
import InteresesScreen from '@/screens/Paciente/InteresesScreen';
import EventosScreen from '@/screens/Paciente/EventosScreen';

const Stack = createNativeStackNavigator<PacienteStackParamList>();

export default function PacienteStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="PacienteHome" component={PacienteHomeScreen} />
      <Stack.Screen name="PerfilPaciente" component={PerfilPacienteScreen} />
      <Stack.Screen name="Sintomas" component={SintomasScreen} />
      <Stack.Screen name="Intereses" component={InteresesScreen} />
      <Stack.Screen name="Eventos" component={EventosScreen} />
    </Stack.Navigator>
  );
}