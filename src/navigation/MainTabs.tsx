// src/navigation/MainTabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { MainTabParamList } from './types';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PacienteStack from './PacienteStack';
import LlamadaStack from './LlamadaStack';
import ReplicacionStack from './ReplicacionStack';
import GrupoStack from './GrupoStack';
import { colors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator<MainTabParamList>();

type RouteName = keyof MainTabParamList;

const ICONS: Record<RouteName, React.ComponentProps<typeof Ionicons>['name']> = {
  PacienteTab: 'person-circle-outline',
  LlamadasTab: 'call-outline',
  GrupoTab: 'people-outline',
  ReplicacionTab: 'mic-outline',
};

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  // estilo base de la barra (lo reutilizamos para sobreescribir por pantalla)
  const baseBarStyle = {
    height: 56 + insets.bottom,
    paddingBottom: Math.max(6, insets.bottom),
    paddingTop: 6,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: baseBarStyle,
        tabBarIcon: ({ color, size }) => {
          const iconName = ICONS[route.name as RouteName];
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="PacienteTab" component={PacienteStack} options={{ title: 'Paciente' }} />

      <Tab.Screen
        name="LlamadasTab"
        component={LlamadaStack}
        options={({ route }) => {
          const nested = getFocusedRouteNameFromRoute(route) ?? 'LlamadaHome';
          const hide = nested === 'LlamadaInstantanea' || nested === 'LlamadaActiva';

          return {
            title: 'Llamadas',
            tabBarStyle: hide
              ? [{ ...baseBarStyle }, { display: 'none' }] as any
              : baseBarStyle,
          };
        }}
      />

      <Tab.Screen name="GrupoTab" component={GrupoStack} options={{ title: 'Grupo' }} />
      <Tab.Screen name="ReplicacionTab" component={ReplicacionStack} options={{ title: 'Replicación' }} />
    </Tab.Navigator>
  );
}
