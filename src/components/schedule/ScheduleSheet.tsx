// src/components/schedule/ScheduleSheet.tsx
import React, { useMemo, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DatePicker from 'react-native-date-picker';
import { Calendar } from 'react-native-calendars';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import DayPill from './DayPill';
import { colors, spacing } from '@/theme';
import { Weekday, ScheduledCall } from '@/domain/schedule/types';

type Props = {
  initial?: Partial<ScheduledCall>;
  onClose: () => void;
  onSave: (payload: Omit<ScheduledCall, 'id'>) => void;
};

export default function ScheduleSheet({ initial, onClose, onSave }: Props) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '85%'], []);
  const [tab, setTab] = useState<'weekly'|'calendar'>(initial?.repeat?.type === 'oneoff' ? 'calendar' : 'weekly');
  const [time, setTime] = useState<Date>(initial?.timeISO ? new Date(initial.timeISO) : new Date());
  const [days, setDays] = useState<Weekday[]>(initial?.repeat?.type==='weekly' ? initial.repeat.days : [1,3,5]);
  const [dateISO, setDateISO] = useState<string | undefined>(initial?.repeat?.type==='oneoff' ? initial.repeat.dateISO : undefined);
  const [note, setNote] = useState(initial?.note ?? '');

  function toggleDay(d: Weekday) {
    setDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d].sort());
  }

  function save() {
    const payload: Omit<ScheduledCall,'id'> = {
      timeISO: time.toISOString(),
      repeat: tab==='weekly' ? { type: 'weekly', days } : { type: 'oneoff', dateISO: dateISO! },
      note,
      active: true,
    };
    onSave(payload);
    ref.current?.close();
  }

  return (
    <BottomSheet ref={ref} index={1} snapPoints={snapPoints} enablePanDownToClose onClose={onClose}>
      <BottomSheetView style={styles.content}>
        {/* tabs */}
        <View style={styles.tabs}>
          <Pressable onPress={()=>setTab('weekly')} style={[styles.tab, tab==='weekly'&&styles.tabOn]}>
            <Text style={styles.tabText}>Llamadas rutinarias</Text>
          </Pressable>
          <Pressable onPress={()=>setTab('calendar')} style={[styles.tab, tab==='calendar'&&styles.tabOn]}>
            <Text style={styles.tabText}>Calendario</Text>
          </Pressable>
        </View>

        {/* selector de hora (rueda) */}
        <View style={styles.pickerWrap}>
          <DatePicker date={time} onDateChange={setTime} mode="time" />
        </View>

        {tab==='weekly' ? (
          <View style={{marginTop: spacing.md, flexDirection:'row', justifyContent:'space-between'}}>
            {([1,2,3,4,5,6,0] as Weekday[]).map((d)=>( 
              <DayPill key={d} label={['D','L','M','X','J','V','S'][d]}
                selected={days.includes(d)} onToggle={()=>toggleDay(d)} />
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

        {/* Botonera */}
        <View style={styles.actions}>
          <Pressable onPress={onClose}><Text style={{color:'#b91c1c', fontWeight:'700'}}>Cancelar</Text></Pressable>
          <Pressable onPress={save}><Text style={{color: colors.primary, fontWeight:'700'}}>Guardar</Text></Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  tabs: { flexDirection:'row', backgroundColor:'#f5d8ff', borderRadius:999, padding:4, alignSelf:'center', marginBottom: spacing.md },
  tab: { paddingVertical:6, paddingHorizontal:12, borderRadius:999 },
  tabOn: { backgroundColor: colors.primary },
  tabText: { color:'#fff', fontWeight:'700' },
  pickerWrap: { alignItems: 'center', marginVertical: spacing.md },
  actions: { marginTop: spacing.xl, flexDirection:'row', justifyContent:'space-between' },
});
