// src/screens/Llamadas/LlamadasHomeScreen.tsx
import React, {useRef, useCallback} from 'react';
import {ScrollView, View, StyleSheet, Text, Pressable} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {LlamadaStackParamList} from '@/navigation/types';
import { useMicPermissionOnLaunch } from '@/permissions/useMicPermission';
import { RESULTS } from 'react-native-permissions';

type Nav = NativeStackNavigationProp<LlamadaStackParamList>;

export default function LlamadasHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { ensureMicPermission, status, micGranted } = useMicPermissionOnLaunch();
  const askedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (askedRef.current) return;
      askedRef.current = true;
      void ensureMicPermission();  // dispara check + request
    }, [ensureMicPermission])
  );

  return (
    <View style={styles.container}>
      <Header title="Llamadas" onInfoPress={() => {}} />

      {/* Panel debug permiso (puedes quitarlo cuando confirmes) */}
      <View style={styles.permBox}>
        <Text style={{fontWeight:'700'}}>Micrófono: {status ?? '—'}</Text>
        {!micGranted && (
          <Pressable style={styles.permBtn} onPress={()=>void ensureMicPermission()}>
            <Text style={{color:'#fff', fontWeight:'700'}}>Solicitar permiso</Text>
          </Pressable>
        )}
        {status === RESULTS.BLOCKED && (
          <Text style={{marginTop:6, color:'#b91c1c'}}>
            El permiso está bloqueado; abre Ajustes desde el diálogo.
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          variant='primary'
          icon="call"
          title="Llamada Instantánea"
          subtitle="Inicia una llamada genérica inmediatamente"
          onPress={() => navigation.navigate('LlamadaInstantanea')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="call-outline"
          title="Llamada rápida"
          subtitle="Inicie una llamada con una configuración rápida"
          onPress={() => navigation.navigate('LlamadaRapida')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="calendar-clear-outline"
          title="Agendar Llamadas"
          subtitle="Programe llamadas con fecha y horas específicas"
          onPress={() => navigation.navigate('AgendarLlamada')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="document-text-outline"
          title="Contextos de Llamada"
          subtitle="Defina contextos para dirigir la conversación de las llamadas"
          onPress={() => navigation.navigate('ContextosDeLlamada')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
  permBox: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    backgroundColor:'#fff',
    borderRadius:12,
    padding: spacing.md,
    elevation:2
  },
  permBtn: {
    marginTop:8,
    backgroundColor: colors.primary,
    paddingVertical:8,
    paddingHorizontal:12,
    borderRadius:8
  }
});
