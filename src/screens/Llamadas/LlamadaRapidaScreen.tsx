// src/screens/Llamadas/LlamadaRapidaScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import { DURATION_OPTIONS } from '@/domain/schedule/options';
import type { LlamadaStackParamList } from '@/navigation/types';
import { useUserContexts } from '@/hooks/useUserContexts';
import { useGroupVoices } from '@/hooks/useGroupVoices';
import { StorageService } from '@/services/StorageService';


type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'LlamadaRapida'>;

export default function LlamadaRapidaScreen() {
  const navigation = useNavigation<Nav>();

  // Contextos reales del usuario
  const { contexts, loading } = useUserContexts();
  const { voices, loading: loadingVoices } = useGroupVoices();

  // Estado UI
  const [contextText, setContextText] = useState('');
  const [contextId, setContextId] = useState<string | undefined>();
  const [showContextList, setShowContextList] = useState(false);

  const [voiceId, setVoiceId] = useState<string | undefined>();
  const [showVoiceList, setShowVoiceList] = useState(false);

  const [durationMin, setDurationMin] = useState<number>(10);
  const [pacientId, setPacientId] = useState<number | null>(null);

  useEffect(() => {
    StorageService.getPacientId().then(setPacientId);
  }, []);

  const voiceLabel = useMemo(
    () => (voiceId ? (voices.find(v => v.id === voiceId)?.label ?? 'Por defecto') : 'Por defecto'),
    [voiceId, voices]
  );

  const startCall = () => {
    if (!pacientId) {
      Alert.alert('Falta paciente', 'No se encontró el ID del paciente en el dispositivo.');
      return;
    }
    if (!contextId) {
      Alert.alert('Falta contexto', 'Selecciona un contexto de la lista para esta llamada.');
      return;
    }
    navigation.navigate('LlamadaActiva', {
      voiceName: voiceLabel ?? 'Voz replicada',
      voiceId: voiceId ?? '',
      pacientId,
      contextItemId: Number(contextId),
      // si quieres, puedes pasar también durationMin
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Llamada Rápida" />

      <ScrollView contentContainerStyle={styles.body}>
        {/* Botón grande de llamada */}
        <Pressable onPress={startCall} style={styles.bigCallBtn}>
          <Ionicons name="call" size={72} color="#fff" />
        </Pressable>

        <View style={styles.card}>
          {/* Contexto */}
          <Text style={styles.fieldLabel}>Contexto</Text>
          <View style={styles.contextRow}>
            <View style={styles.inputWrap}>
              <TextInput
                value={contextText}
                onChangeText={(t) => { setContextText(t); setContextId(undefined); }}
                placeholder="Escriba o seleccione el contexto para esta llamada."
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
                multiline
              />
              <Pressable onPress={() => setShowContextList(v => !v)} style={styles.inlineButton}>
                <Ionicons name="chevron-down" size={18} color={colors.text} />
              </Pressable>
            </View>

            <Pressable onPress={() => { /* opcional: dictado por voz */ }} style={styles.roundSideBtn}>
              <Ionicons name="mic-outline" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Lista de contextos (reales) */}
          {loading ? (
            <View style={{ paddingVertical: spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : showContextList && (
            <View style={styles.dropdown}>
              {contexts.map(c => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setContextId(String(c.id));
                    setContextText(c.description || c.title);
                    setShowContextList(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>{c.title}</Text>
                </Pressable>
              ))}
              {contexts.length === 0 && (
                <View style={{ padding: spacing.md }}>
                  <Text style={{ color: colors.textMuted }}>No hay contextos disponibles.</Text>
                </View>
              )}
            </View>
          )}

          {/* Voz replicada */}
          <Text style={styles.fieldLabel}>Voz replicada</Text>
          <Pressable style={styles.selectRow} onPress={() => setShowVoiceList(v => !v)}>
            <Text style={voiceLabel ? styles.selectValue : styles.selectPlaceholder}>
              {voiceLabel ?? 'Por defecto'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.text} />
          </Pressable>

          {showVoiceList && (
            <View style={styles.dropdown}>
              {loadingVoices ? (
                <Text style={{ padding: spacing.md, color: colors.textMuted }}>Cargando voces…</Text>
              ) : (
                voices.map(v => (
                  <Pressable
                    key={v.id + v.label}
                    onPress={() => { setVoiceId(v.id); setShowVoiceList(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>{v.label}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Duración */}
          <Text style={styles.fieldLabel}>Duración aproximada</Text>
          <View style={styles.chipsRow}>
            {DURATION_OPTIONS.map(m => {
              const on = durationMin === m;
              return (
                <Pressable key={m} onPress={() => setDurationMin(m)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{m} min</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_BG = '#F5D8FF';

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  bigCallBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  fieldLabel: {
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },

  // Contexto input + botones
  contextRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  inputWrap: { flex: 1, position: 'relative' },
  textInput: {
    minHeight: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: 44, // espacio para el chevron
    color: colors.text,
    textAlignVertical: 'top',
  },
  inlineButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundSideBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Select de voz
  selectRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: { color: '#9CA3AF' },
  selectValue: { color: colors.text, fontWeight: '600' },

  // Dropdown reutilizable
  dropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  dropdownItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  dropdownText: { color: colors.text },

  // Chips de duración
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: '#F3F4F6' },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color: '#4B5563', fontWeight: '600' },
  chipTextOn: { color: '#fff' },
});
