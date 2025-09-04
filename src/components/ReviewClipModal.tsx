import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { colors, spacing } from '@/theme';

type Props = {
  visible: boolean;
  playing: boolean;
  canPlay?: boolean;
  loading?: boolean;             // 👈 nuevo
  onTogglePlay: () => void;
  onAccept: () => void;
  onDiscard: () => void;
};

export default function ReviewClipModal({
  visible, playing, canPlay = true, loading = false,
  onTogglePlay, onAccept, onDiscard,
}: Props) {
  const disabled = loading || !canPlay;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent hardwareAccelerated onRequestClose={onDiscard}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Ionicons name="school-outline" size={48} color={colors.primary} />
          <Text style={styles.title}>
            El siguiente <Text style={{ fontWeight: '900' }}>audio se utilizará</Text> para el{' '}
            <Text style={{ fontWeight: '900' }}>entrenamiento</Text> de reconocer tu voz.
          </Text>

          <TouchableOpacity
            onPress={onTogglePlay}
            disabled={disabled}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.player, disabled && { opacity: 0.5 }]}
          >
            <Ionicons name={playing ? 'pause' : 'play'} size={22} color="#fff" />
            <View style={styles.wave} />
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onDiscard} disabled={loading}>
              <Text style={[styles.discard, loading && { opacity: 0.6 }]}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAccept} style={styles.acceptBtn} activeOpacity={0.8} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.acceptText}>Aceptar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.card, width: '100%', borderRadius: 16, padding: spacing.lg, alignItems: 'center', gap: spacing.md },
  title: { color: colors.text, textAlign: 'center', lineHeight: 20 },
  player: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, alignSelf: 'stretch', justifyContent: 'center' },
  wave: { height: 18, flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 9 },
  actions: { marginTop: spacing.sm, alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  discard: { color: colors.textMuted, textDecorationLine: 'underline' },
  acceptBtn: { backgroundColor: '#7c3aed', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  acceptText: { color: '#fff', fontWeight: '800' },
});
