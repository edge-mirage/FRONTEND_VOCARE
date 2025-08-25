// src/navigation/MainTabs.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from './types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PacienteStack from './PacienteStack';
import LlamadaStack from './LlamadaStack';
import ReplicacionStack from './ReplicacionStack';
import GrupoStack from './GrupoStack';
import {colors} from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RouteName = keyof MainTabParamList;

const ICONS: Record<RouteName, React.ComponentProps<typeof Ionicons>['name']> = {
  PacienteTab: 'person-circle-outline',
  LlamadasTab: 'call-outline',
  GrupoTab: 'people-outline',
  ReplicacionTab: 'mic-outline',
  HomeTab: 'home-outline',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="ReplicacionTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: Math.max(6, insets.bottom), // deja solo este
          paddingTop: 6,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = ICONS[route.name as RouteName];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      
      <Tab.Screen name="PacienteTab" component={PacienteStack} options={{ title: 'Paciente' }} />
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="LlamadasTab" component={LlamadaStack} options={{ title: 'Llamadas' }} />
      <Tab.Screen name="GrupoTab" component={GrupoStack} options={{ title: 'Grupo' }} />
      <Tab.Screen name="ReplicacionTab" component={ReplicacionStack} options={{ title: 'Replicación' }} />
    </Tab.Navigator>
  );
}
