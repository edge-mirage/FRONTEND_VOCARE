// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import HomeStack from './HomeStack';
import RegistroStack from './RegistroStack'; // <-- Importa tu RegistroStack

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="RegistroStack" // <-- Empieza aquí!
      >
        <Stack.Screen name="RegistroStack" component={RegistroStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="HomeStack" component={HomeStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
