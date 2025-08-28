import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { ScheduledCall, Weekday } from '@/domain/schedule/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function fmtTime(iso: string) {
  const d = new Date(iso);
  const time = format(d, 'hh:mm', { locale: es });
  const mer = format(d, 'a', { locale: es }).toUpperCase();
  return { time, meridiem: mer === 'AM' ? 'a.m.' : 'p.m.' };
}

const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const SIDE_WIDTH = 68;

export default function ScheduleCard({
  item, onPress, onToggle, onDelete,
}: { item: ScheduledCall; onPress:()=>void; onToggle:(v:boolean)=>void; onDelete:()=>void }) {
  const { time, meridiem } = fmtTime(item.timeISO);
  const weekly = item.repeat.type === 'weekly' ? item.repeat.days : null;
  const oneoff = item.repeat.type === 'oneoff' ? item.repeat.dateISO : null;

  const inactive = !item.active;

  return (
    <Pressable onPress={onPress} style={[styles.wrap, inactive && styles.wrapOff]}>
      <View style={styles.inner}>
        <View style={styles.sideCol}>
          <Text style={[styles.time, inactive && styles.timeOff]}>{time}</Text>
          <Text style={[styles.meridiem, inactive && styles.meridiemOff]}>{meridiem}</Text>
        </View>
        <View style={styles.mainCol}>
          {weekly && (
            <View style={styles.daysRow}>
              {ORDER.map((day) => (
                <Text
                  key={day}
                  style={[
                    styles.day,
                    weekly.includes(day)
                      ? inactive ? styles.dayOnOff : styles.dayOn
                      : inactive ? styles.dayOffOff : styles.dayOff
                  ]}>
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'][day]}
                </Text>
              ))}
            </View>
          )}
          {oneoff && (
            <Text style={[styles.oneoffDate, inactive && styles.oneoffDateOff]}>
              {format(new Date(oneoff), 'd MMMM', { locale: es })}
            </Text>
          )}
          <Text style={[styles.note, inactive && styles.noteOff]}>{item.note}</Text>
        </View>
        <View style={styles.rightWrap}>
          <Switch value={item.active} onValueChange={onToggle} trackColor={{ false: '#767577', true: colors.primary }} />
          <Pressable onPress={onDelete} style={{ marginTop: 16 }}>
            <Ionicons name="trash" size={24} color={inactive ? '#9CA3AF' : '#EF4444'} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
    marginBottom: spacing.md,
  },
  wrapOff: { backgroundColor: '#F3F4F6' },

  inner: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: spacing.md, paddingRight: spacing.md },
  sideCol: { width: SIDE_WIDTH, alignItems: 'flex-end' },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeWrap: { flexDirection: 'row', alignItems: 'flex-end' },

  time: { fontSize: 28, fontWeight: '800', color: colors.text },
  timeOff: { color: '#6B7280' },
  meridiem: { marginLeft: 6, fontSize: 14, color: colors.textMuted, alignSelf: 'flex-end' },
  meridiemOff: { color: '#9CA3AF' },

  rightWrap: { marginLeft: spacing.md, flex: 1, alignItems: 'flex-end' },

  daysRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  day: { marginLeft: 6, fontWeight: '700', letterSpacing: 1 },
  dayOn: { color: '#6D28D9' },
  dayOff: { color: '#8B5CF6', opacity: 0.35 },
  dayOnOff: { color: '#9CA3AF' },
  dayOffOff: { color: '#D1D5DB' },

  oneoffDate: { fontWeight: '700', color: colors.text, marginTop: 2 },
  oneoffDateOff: { color: '#6B7280' },

  note: { marginTop: 4, color: colors.text, fontSize: 15 },
  noteOff: { color: '#6B7280' },
});