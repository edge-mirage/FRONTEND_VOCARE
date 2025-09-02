// src/components/schedule/ScheduleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';
import { ScheduledCall, Weekday } from '@/domain/schedule/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function fmtTime(iso: string) {
  const d = new Date(iso);
  const time = format(d, 'hh:mm');
  const mer = format(d, 'a').toUpperCase();
  return { time, meridiem: mer === 'AM' ? 'a.m.' : 'p.m.' };
}

const ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0]; // L M X J V S D
const SIDE_WIDTH = 68;

export default function ScheduleCard({
  item, onPress, onToggle, onDelete,
}: { item: ScheduledCall; onPress:()=>void; onToggle:(v:boolean)=>void; onDelete:()=>void }) {
  const { time, meridiem } = fmtTime(item.timeISO);
  const weekly = item.repeat.type === 'weekly' ? item.repeat.days : null;
  const oneoff = item.repeat.type === 'oneoff' ? item.repeat.dateISO : null;

  const inactive = !item.active; // ← apagado = escala de grises

  return (
    <Pressable onPress={onPress} style={[styles.card, inactive && styles.cardOff]}>
      <View style={styles.row}>
        {/* IZQUIERDA */}
        <View style={styles.leftCol}>
          <View style={styles.headerRow}>
            <View style={styles.timeWrap}>
              <Text style={[styles.time, inactive && styles.timeOff]}>{time}</Text>
              <Text style={[styles.meridiem, inactive && styles.meridiemOff]}>{meridiem}</Text>
            </View>

            <View style={styles.rightWrap}>
              {weekly && (
                <View style={styles.daysRow}>
                  {ORDER.map((d) => {
                    const label = ['D','L','M','X','J','V','S'][d];
                    const selected = weekly.includes(d);
                    const dayStyle = inactive
                      ? (selected ? styles.dayOnOff : styles.dayOffOff)
                      : (selected ? styles.dayOn : styles.dayOff);
                    return (
                      <Text key={d} style={[styles.day, dayStyle]}>{label}</Text>
                    );
                  })}
                </View>
              )}
              {oneoff && (
                <Text style={[styles.oneoffDate, inactive && styles.oneoffDateOff]}>
                  {format(new Date(oneoff), "d 'de' MMMM", { locale: es })}
                </Text>
              )}
            </View>
          </View>

          {item.note ? (
            <Text style={[styles.note, inactive && styles.noteOff]}>
              <Text style={[styles.noteLabel, inactive && styles.noteLabelOff]}>Detalle: </Text>
              {item.note}
            </Text>
          ) : null}
        </View>

        {/* DERECHA */}
        <View style={styles.sideCol}>
          <Switch
            value={item.active}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D5DB', true: '#A855F7' }}
            thumbColor={item.active ? '#fff' : '#f4f4f5'}
          />
          <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={6}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5E6FF',       // activo: lila
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  cardOff: {
    backgroundColor: '#F3F4F6',       // apagado: gris 100
  },

  row: { flexDirection: 'row', alignItems: 'flex-start' },
  leftCol: { flex: 1, paddingRight: spacing.md },
  sideCol: { width: SIDE_WIDTH, alignItems: 'flex-end' },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeWrap: { flexDirection: 'row', alignItems: 'flex-end' },

  time: { fontSize: 28, fontWeight: '800', color: colors.text },
  timeOff: { color: '#6B7280' },          // gris-500
  meridiem: { marginLeft: 6, fontSize: 14, color: colors.textMuted, alignSelf: 'flex-end' },
  meridiemOff: { color: '#9CA3AF' },      // gris-400

  rightWrap: { marginLeft: spacing.md, flex: 1, alignItems: 'flex-end' },

  daysRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  day: { marginLeft: 6, fontWeight: '700', letterSpacing: 1 },
  dayOn: { color: '#6D28D9' },            // morado fuerte
  dayOff: { color: '#8B5CF6', opacity: 0.35 },
  dayOnOff: { color: '#9CA3AF' },         // gris para seleccionados (apagado)
  dayOffOff: { color: '#D1D5DB' },        // gris más claro para no seleccionados (apagado)

  oneoffDate: { fontWeight: '700', color: colors.text, marginTop: 2 },
  oneoffDateOff: { color: '#6B7280' },

  note: { marginTop: spacing.sm, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  noteOff: { color: '#9CA3AF' },
  noteLabel: { fontWeight: '700', color: colors.text },
  noteLabelOff: { color: '#6B7280' },

  deleteBtn: {
    marginTop: spacing.sm,
    backgroundColor: '#EF4444',
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
});
