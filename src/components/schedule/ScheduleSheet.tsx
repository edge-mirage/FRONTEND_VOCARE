import React, { useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DayPill from '@/components/DayPill';
import { colors, spacing } from '@/theme';
import { Weekday, ScheduledCall, OneoffRepeat, WeeklyRepeat } from '@/domain/schedule/types';
import { CONTEXT_PRESETS, VOICE_OPTIONS, DURATION_OPTIONS } from '@/domain/schedule/options';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


type Props = {
  initial?: Partial<ScheduledCall>;
  onClose: () => void;
  onSave: (payload: Omit<ScheduledCall, 'id'|'user_id'|'created_at'|'updated_at'>) => void;
};

export default function ScheduleSheet({ initial, onClose, onSave }: Props) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);
  const [tab, setTab] = useState<'weekly'|'calendar'>(initial?.repeat?.type === 'oneoff' ? 'calendar' : 'weekly');
  const [time, setTime] = useState<Date>(initial?.timeISO ? new Date(initial.timeISO) : new Date());
  const [days, setDays] = useState<Weekday[]>(
    initial?.repeat?.type==='weekly' ? initial.repeat.days : [1,3,5]
  );
  const [date, setDate] = useState(
    initial?.repeat?.type === 'oneoff'
    ? initial.repeat.dateISO || new Date().toISOString()
    : new Date().toISOString()
  );
  const [note, setNote] = useState(initial?.note || '');
  const [context, setContext] = useState(initial?.contextId || CONTEXT_PRESETS[0]);
  const [voice, setVoice] = useState(initial?.voiceId || VOICE_OPTIONS[0]);
  const [duration, setDuration] = useState(initial?.durationMin || 10);
  const [showDuration, setShowDuration] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showContext, setShowContext] = useState(false);

  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const selectedDate = useMemo(() => {
    return date ? { [date.split('T')[0]]: { selected: true } } : {};
  }, [date]);

  const handleDayToggle = (day: Weekday) => {
    setDays((prev) => {
      const idx = prev.indexOf(day);
      if (idx > -1) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const handleSave = () => {
    let repeatData: WeeklyRepeat | OneoffRepeat;
    if (tab === 'weekly') {
      if (days.length === 0) {
        Alert.alert('Error', 'Debes seleccionar al menos un día de la semana.');
        return;
      }
      repeatData = { type: 'weekly', days: days.sort() };
    } else {
      repeatData = { type: 'oneoff', dateISO: date };
    }

    const payload: Omit<ScheduledCall, 'id'|'user_id'|'created_at'|'updated_at'> = {
      timeISO: time.toISOString(),
      repeat: repeatData,
      note,
      contextId: context,
      voiceId: voice,
      durationMin: duration,
      active: true,
    };
    onSave(payload);
  };
  
  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      onClose={onClose}
      index={isVisible ? 0 : -1}
      enablePanDownToClose
      backgroundStyle={styles.sheet}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>
            {initial ? 'Editar Llamada' : 'Nueva Llamada'}
          </Text>
          <Pressable onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Guardar</Text>
          </Pressable>
        </View>

        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setTab('weekly')}
            style={[styles.tab, tab === 'weekly' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'weekly' && styles.tabTextActive]}>Semanal</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('calendar')}
            style={[styles.tab, tab === 'calendar' && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === 'calendar' && styles.tabTextActive]}>Única</Text>
          </Pressable>
        </View>

        <View style={styles.timeSection}>
          <DatePicker
            date={time}
            onDateChange={setTime}
            mode="time"
            locale='es'
            androidVariant='nativeAndroid'
          />
        </View>

        <View style={styles.section}>
          {tab === 'weekly' ? (
            <View style={styles.daysContainer}>
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
                <DayPill
                  key={index}
                  label={day}
                  selected={days.includes(index as Weekday)}
                  onToggle={() => handleDayToggle(index as Weekday)}
                />
              ))}
            </View>
          ) : (
            <Calendar
              current={date}
              onDayPress={(day) => setDate(day.dateString)}
              markedDates={selectedDate}
              theme={{
                todayTextColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#fff',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '700',
              }}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={styles.textarea}
            value={note}
            onChangeText={setNote}
            placeholder="Añade una nota para recordarte por qué agendaste esta llamada..."
            multiline
          />
        </View>

        {/* Sección de opciones avanzadas */}
        <View style={styles.section}>
          <Pressable onPress={() => setShowContext(!showContext)} style={styles.selectRow}>
            <Text style={styles.label}>Contexto</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.selectTextValue}>{context}</Text>
              <Ionicons name={showContext ? "chevron-up" : "chevron-down"} size={16} color={colors.text} style={{ marginLeft: spacing.sm }}/>
            </View>
          </Pressable>
          {showContext && (
            <View style={styles.dropdown}>
              {CONTEXT_PRESETS.map(ctx => (
                <Pressable
                  key={ctx}
                  style={styles.dropdownItem}
                  onPress={() => { setContext(ctx); setShowContext(false); }}
                >
                  <Text style={styles.dropdownText}>{ctx}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable onPress={() => setShowVoice(!showVoice)} style={[styles.selectRow, { marginTop: spacing.sm }]}>
            <Text style={styles.label}>Voz</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.selectTextValue}>{voice}</Text>
              <Ionicons name={showVoice ? "chevron-up" : "chevron-down"} size={16} color={colors.text} style={{ marginLeft: spacing.sm }}/>
            </View>
          </Pressable>
          {showVoice && (
            <View style={styles.dropdown}>
              {VOICE_OPTIONS.map(v => (
                <Pressable
                  key={v}
                  style={styles.dropdownItem}
                  onPress={() => { setVoice(v); setShowVoice(false); }}
                >
                  <Text style={styles.dropdownText}>{v}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable onPress={() => setShowDuration(!showDuration)} style={[styles.selectRow, { marginTop: spacing.sm }]}>
            <Text style={styles.label}>Duración</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.selectTextValue}>{duration} min</Text>
              <Ionicons name={showDuration ? "chevron-up" : "chevron-down"} size={16} color={colors.text} style={{ marginLeft: spacing.sm }}/>
            </View>
          </Pressable>
          {showDuration && (
            <View style={styles.dropdown}>
              {DURATION_OPTIONS.map(d => (
                <Pressable
                  key={d}
                  style={styles.dropdownItem}
                  onPress={() => { setDuration(d); setShowDuration(false); }}
                >
                  <Text style={styles.dropdownText}>{d} min</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: '#F9FAFB', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  closeBtn: { padding: spacing.sm },
  saveBtn: { padding: spacing.sm },
  saveText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary, borderRadius: 10 },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  section: { marginBottom: spacing.lg },

  timeSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  textarea: {
    minHeight: 68,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: spacing.md,
    paddingRight: spacing.xl + 8,
    textAlignVertical: 'top',
    color: colors.text,
  },
  dropdownBtn: {
    position: 'absolute', right: 8, top: 8,
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  selectRow: {
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: { color: '#9CA3AF' },
  selectTextValue: { color: colors.text, fontWeight:'600' },

  dropdown: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  dropdownItem: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  dropdownText: { color: colors.text },

  chipsRow: { flexDirection:'row', flexWrap:'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  chipText: { color: colors.text },
});