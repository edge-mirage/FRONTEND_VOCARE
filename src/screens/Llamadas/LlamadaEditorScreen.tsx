// src/screens/Llamadas/LlamadaEditorScreen.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Header from '@/components/Header';
import DayPill from '@/components/schedule/DayPill';
import { colors, spacing } from '@/theme';
import type { Weekday, ScheduledCall } from '@/domain/schedule/types';
import { VOICE_OPTIONS, DURATION_OPTIONS } from '@/domain/schedule/options';
import type { LlamadaStackParamList } from '@/navigation/types';
import { useGroupUuid } from '@/hooks/useGroupUuid';
import { obtenerContextoPorGrupo } from '@/crud/family';

type Nav = NativeStackNavigationProp<LlamadaStackParamList, 'LlamadaEditor'>;
type Rt = RouteProp<LlamadaStackParamList, 'LlamadaEditor'>;

type CtxOption = { id: string; label: string; description?: string };

export default function LlamadaEditorScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const initial = params?.initial;

  const { groupUuid } = useGroupUuid();

  const [tab, setTab] = useState<'weekly'|'calendar'>(initial?.repeat?.type === 'oneoff' ? 'calendar' : 'weekly');
  const [time, setTime] = useState<Date>(initial?.timeISO ? new Date(initial.timeISO) : new Date());
  const [days, setDays] = useState<Weekday[]>(initial?.repeat?.type === 'weekly' ? initial.repeat.days : [1,3,5]);
  const [dateISO, setDateISO] = useState<string | undefined>(initial?.repeat?.type === 'oneoff' ? initial.repeat.dateISO : undefined);

  const [contextText, setContextText] = useState(initial?.note ?? '');
  const [contextId, setContextId] = useState<string | undefined>(initial?.contextId);
  const [voiceId, setVoiceId] = useState<string | undefined>(initial?.voiceId);
  const [durationMin, setDurationMin] = useState<number>(initial?.durationMin ?? 10);

  const [showContextList, setShowContextList] = useState(false);
  const [showVoiceList, setShowVoiceList] = useState(false);

  // 👇 cargar contextos del backend del grupo actual
  const [ctxOptions, setCtxOptions] = useState<CtxOption[]>([]);
  const [ctxLoading, setCtxLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!groupUuid) return;
      setCtxLoading(true);
      try {
        const ctx = await obtenerContextoPorGrupo(groupUuid);
        const opts = (ctx?.items ?? []).map((it: any) => ({
          id: String(it.id),
          label: it.title,
          description: it.description,
        })) as CtxOption[];
        setCtxOptions(opts);

        // si venimos con contextId, y no hay texto, lo rellenamos con el label
        if (initial?.contextId && !initial?.note) {
          const found = opts.find(o => o.id === initial.contextId);
          if (found) setContextText(found.label);
        }
      } catch (e) {
        // silencioso: el usuario igual puede escribir texto libre
      } finally {
        setCtxLoading(false);
      }
    })();
  }, [groupUuid]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleDay(d: Weekday) {
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort());
  }

  const canSave = tab === 'weekly' ? days.length > 0 : !!dateISO;

  function save() {
    const payload: Omit<ScheduledCall, 'id'> = {
      timeISO: time.toISOString(),
      repeat: tab === 'weekly' ? { type: 'weekly', days } : { type: 'oneoff', dateISO: dateISO! },
      note: contextText,         // texto libre (si eligió del listado, aquí queda el label)
      contextId,                 // id del contexto del grupo (opcional)
      durationMin,
      voiceId,
      active: initial?.active ?? true,
    };
    params?.onSubmit?.(payload, initial?.id);
    navigation.goBack();
  }

  const voiceLabel = useMemo(
    () => (voiceId ? VOICE_OPTIONS.find(v=>v.id===voiceId)?.label : undefined),
    [voiceId]
  );

  return (
    <View style={{flex:1, backgroundColor: colors.background}}>
      <Header title={initial ? 'Editar llamada' : 'Nueva llamada'} />

      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.select({ ios:'padding', android: undefined })}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* tabs */}
          <View style={styles.tabs}>
            <Pressable onPress={()=>setTab('weekly')} style={[styles.tab, tab==='weekly' && styles.tabOn]}>
              <Text style={styles.tabText}>Llamadas rutinarias</Text>
            </Pressable>
            <Pressable onPress={()=>setTab('calendar')} style={[styles.tab, tab==='calendar' && styles.tabOn]}>
              <Text style={styles.tabText}>Calendario</Text>
            </Pressable>
          </View>

          {/* hora */}
          <View style={styles.pickerWrap}>
            <DatePicker date={time} onDateChange={setTime} mode="time" />
          </View>

          {/* patrón */}
          {tab==='weekly' ? (
            <View style={{marginTop: spacing.md, flexDirection:'row', justifyContent:'space-between'}}>
              {([1,2,3,4,5,6,0] as Weekday[]).map((d)=>( // L M X J V S D
                <DayPill
                  key={d}
                  label={['D','L','M','X','J','V','S'][d]}
                  selected={days.includes(d)}
                  onToggle={()=>toggleDay(d)}
                />
              ))}
            </View>
          ) : (
            <Calendar
              onDayPress={(d)=>setDateISO(d.dateString)}
              markedDates={dateISO ? { [dateISO]: { selected:true } } : {}}
              theme={{ todayTextColor: colors.primary, selectedDayBackgroundColor: colors.primary }}
              style={{ marginTop: spacing.md, borderRadius: 12 }}
            />
          )}

          {/* contexto */}
          <Text style={styles.fieldLabel}>Contexto</Text>
          <View style={styles.contextRow}>
            <TextInput
              value={contextText}
              onChangeText={(t)=>{ setContextText(t); setContextId(undefined); }} // si escribe, quitamos id
              placeholder="Escriba o seleccione el contexto para esta llamada"
              placeholderTextColor="#9CA3AF"
              style={styles.textarea}
              multiline
            />
            <Pressable onPress={()=>setShowContextList(v=>!v)} style={styles.dropdownBtn}>
              <Ionicons name="chevron-down" size={18} color={colors.text} />
            </Pressable>
          </View>

          {showContextList && (
            <View style={styles.dropdown}>
              {ctxLoading ? (
                <View style={{padding: 12, alignItems:'center'}}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : ctxOptions.length ? (
                ctxOptions.map(p => (
                  <Pressable
                    key={p.id}
                    onPress={() => { setContextId(p.id); setContextText(p.description || p.label); setShowContextList(false); }}
                    style={styles.dropdownItem}
                  >
                    <Text style={styles.dropdownText}>{p.label}</Text>
                    {!!p.description && <Text style={[styles.dropdownText, {color: colors.textMuted, marginTop: 2}]} numberOfLines={2}>{p.description}</Text>}
                  </Pressable>
                ))
              ) : (
                <View style={{padding: 12}}>
                  <Text style={{color: colors.textMuted}}>
                    No tienes contextos aún. Puedes crearlos en “Contextos de Llamada”.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* voz replicada (de momento estático) */}
          <Text style={styles.fieldLabel}>Voz replicada</Text>
          <Pressable style={styles.selectRow} onPress={()=>setShowVoiceList(v=>!v)}>
            <Text style={voiceLabel ? styles.selectTextValue : styles.selectPlaceholder}>
              {voiceLabel ?? 'Seleccione una voz replicada a usar'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.text} />
          </Pressable>
          {showVoiceList && (
            <View style={styles.dropdown}>
              {VOICE_OPTIONS.map(v => (
                <Pressable
                  key={v.id}
                  onPress={() => { setVoiceId(v.id); setShowVoiceList(false); }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>{v.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* duración */}
          <Text style={styles.fieldLabel}>Duración aproximada</Text>
          <View style={styles.chipsRow}>
            {DURATION_OPTIONS.map(m => {
              const on = durationMin === m;
              return (
                <Pressable key={m} onPress={()=>setDurationMin(m)} style={[styles.chip, on && styles.chipOn]}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{m} min</Text>
                </Pressable>
              );
            })}
          </View>

          {/* acciones */}
          <View style={styles.actions}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={{color:'#b91c1c', fontWeight:'700'}}>Cancelar</Text>
            </Pressable>
            <Pressable disabled={!canSave} onPress={save}>
              <Text style={{color: canSave ? colors.primary : '#9CA3AF', fontWeight:'700'}}>Guardar</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  tabs: { flexDirection:'row', backgroundColor:'#f5d8ff', borderRadius:999, padding:4, alignSelf:'center', marginBottom: spacing.md },
  tab: { paddingVertical:6, paddingHorizontal:12, borderRadius:999 },
  tabOn: { backgroundColor: colors.primary },
  tabText: { color:'#fff', fontWeight:'700' },
  pickerWrap: { alignItems: 'center', marginVertical: spacing.md },
  fieldLabel: { marginTop: spacing.lg, marginBottom: spacing.sm, fontWeight:'700', color: colors.text },
  contextRow: { position:'relative' },
  textarea: {
    minHeight: 68, borderRadius: 12, backgroundColor: '#fff',
    padding: spacing.md, paddingRight: spacing.xl + 8, textAlignVertical: 'top', color: colors.text,
  },
  dropdownBtn: {
    position:'absolute', right:8, top:8, width:32, height:32, borderRadius:16,
    alignItems:'center', justifyContent:'center', backgroundColor:'#F3F4F6',
  },
  selectRow: {
    borderRadius: 12, backgroundColor: '#fff', paddingVertical: spacing.md,
    paddingHorizontal: spacing.md, flexDirection:'row', alignItems:'center', justifyContent:'space-between',
  },
  selectPlaceholder: { color: '#9CA3AF' },
  selectTextValue: { color: colors.text, fontWeight:'600' },
  dropdown: { marginTop:6, backgroundColor:'#fff', borderRadius:12, overflow:'hidden', elevation:3 },
  dropdownItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor:'#eee' },
  dropdownText: { color: colors.text },
  chipsRow: { flexDirection:'row', flexWrap:'wrap', gap: 8 },
  chip: { paddingVertical:8, paddingHorizontal:12, borderRadius:999, backgroundColor:'#F3F4F6' },
  chipOn: { backgroundColor: colors.primary },
  chipText: { color:'#4B5563', fontWeight:'600' },
  chipTextOn: { color:'#fff' },
  actions: { marginTop: spacing.xl, flexDirection:'row', justifyContent:'space-between' },
});
