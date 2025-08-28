// import React, { useState } from 'react';
// import { View, Text, Pressable, StyleSheet } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// import { colors, spacing } from '@/theme';
// import type { ReplicacionStackParamList } from '@/navigation/types';

// type Props = NativeStackScreenProps<ReplicacionStackParamList, 'ReplicacionScreenSure'>;

// export default function ReplicacionScreenSure({ route, navigation }: Props) {
//   const { audio } = route.params;
//   const [isPlaying, setIsPlaying] = useState(false); // mock: no audio real

//   return (
//     <View style={styles.overlay}>
//       <View style={styles.card}>
//         {/* Cerrar / salir */}
//         <Pressable style={styles.close} onPress={() => navigation.goBack()}>
//           <Ionicons name="close" size={20} color={colors.primary} />
//         </Pressable>

//         {/* Logo o ícono */}
//         <View style={styles.logoWrap}>
//           <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
//         </View>

//         <Text style={styles.title}>
//           El siguiente <Text style={{ fontWeight: '800' }}>audio</Text> se utilizará para el
//           entrenamiento de reconocer tu voz.
//         </Text>

//         {/* Player mock */}
//         <View style={styles.player}>
//           <Pressable onPress={() => setIsPlaying(v => !v)} style={styles.playBtn}>
//             <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
//           </Pressable>
//           <Ionicons name="pulse" size={24} color={colors.primary} style={{ marginLeft: 12 }} />
//           <Text style={styles.duration}>
//             {String(Math.floor(audio.durationSec / 60)).padStart(2, '0')}:
//             {String(audio.durationSec % 60).padStart(2, '0')}
//           </Text>
//         </View>

//         {/* Acciones */}
//         <View style={styles.actionsRow}>
//           <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => navigation.goBack()}>
//             <Text style={[styles.btnGhostText]}>Reintentar</Text>
//           </Pressable>

//           <Pressable
//             style={[styles.btn, styles.btnTextOnly]}
//             onPress={() => navigation.popToTop()}
//           >
//             <Text style={styles.btnTextOnlyLabel}>Descartar</Text>
//           </Pressable>

//           <Pressable
//             style={[styles.btn, styles.btnPrimary]}
//             onPress={() => navigation.replace('VocesRegistradas')}
//           >
//             <Text style={styles.btnPrimaryText}>Aceptar</Text>
//           </Pressable>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
//     alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
//   },
//   card: {
//     width: '100%', borderRadius: 14, backgroundColor: colors.card ?? '#fff',
//     padding: spacing.xl, position: 'relative', elevation: 4,
//     shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
//   },
//   close: { position: 'absolute', right: spacing.md, top: spacing.md, padding: 6 },
//   logoWrap: {
//     alignSelf: 'center', width: 56, height: 56, borderRadius: 28,
//     backgroundColor: '#F0E5F8', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
//   },
//   title: { textAlign: 'center', color: colors.text, opacity: 0.95, marginBottom: spacing.lg },
//   player: {
//     flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
//     backgroundColor: '#f6f0fb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12,
//     marginBottom: spacing.lg,
//   },
//   playBtn: {
//     width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
//     alignItems: 'center', justifyContent: 'center',
//   },
//   duration: { marginLeft: 10, color: colors.text, opacity: 0.7, fontWeight: '600' },

//   actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
//   btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, minWidth: 110, alignItems: 'center' },
//   btnPrimary: { backgroundColor: colors.primary },
//   btnPrimaryText: { color: '#fff', fontWeight: '800' },
//   btnGhost: { backgroundColor: '#eee' },
//   btnGhostText: { color: '#2b2b2b', fontWeight: '700' },
//   btnTextOnly: { backgroundColor: 'transparent' },
//   btnTextOnlyLabel: { color: colors.textMuted ?? '#6B6B6B', textDecorationLine: 'underline', fontWeight: '600' },
// });


import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReplicacionStackParamList, 'ReplicacionScreenSure'>;

export default function ReplicacionScreenSure({ route, navigation }: Props) {
  const { audio } = route.params;
  const [isPlaying, setIsPlaying] = useState(false); // mock: no audio real

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Cerrar / salir */}
        <Pressable style={styles.close} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color={colors.primary} />
        </Pressable>

        {/* Logo o ícono */}
        <View style={styles.logoWrap}>
          <Ionicons name="sparkles-outline" size={28} color={colors.primary} />
        </View>

        <Text style={styles.title}>
          El siguiente <Text style={{ fontWeight: '800' }}>audio</Text> se utilizará para el
          entrenamiento de reconocer tu voz.
        </Text>

        {/* Player mock */}
        <View style={styles.player}>
          <Pressable onPress={() => setIsPlaying(v => !v)} style={styles.playBtn}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
          </Pressable>
          <Ionicons name="pulse" size={24} color={colors.primary} style={{ marginLeft: 12 }} />
          <Text style={styles.duration}>
            {String(Math.floor(audio.durationSec / 60)).padStart(2, '0')}:
            {String(audio.durationSec % 60).padStart(2, '0')}
          </Text>
        </View>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          {/* DESCARTAR AUDIO: cerrar modal y resetear la screen de grabación */}
          <Pressable
            style={[styles.btn, styles.btnTextOnly]}
            onPress={() => {
              navigation.goBack(); // cierra el modal
              setTimeout(() => {
                navigation.navigate({
                  name: 'ReconocimientoVoz',
                  params: { reset: true },   // ← solo reset, NO auto-start
                  merge: true,
                } as never);
              }, 0);
            }}
          >
            <Text style={styles.btnTextOnlyLabel}>Descartar audio</Text>
          </Pressable>


          {/* ACEPTAR: ir a tareas (Replicacion) */}
          <Pressable
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.replace('Replicacion', { justRecorded: true })}
          >
            <Text style={styles.btnPrimaryText}>Aceptar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  card: {
    width: '100%', borderRadius: 14, backgroundColor: colors.card ?? '#fff',
    padding: spacing.xl, position: 'relative', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },
  close: { position: 'absolute', right: spacing.md, top: spacing.md, padding: 6 },
  logoWrap: {
    alignSelf: 'center', width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#F0E5F8', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { textAlign: 'center', color: colors.text, opacity: 0.95, marginBottom: spacing.lg },
  player: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: '#f6f0fb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: spacing.lg,
  },
  playBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  duration: { marginLeft: 10, color: colors.text, opacity: 0.7, fontWeight: '600' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, minWidth: 110, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
  btnGhost: { backgroundColor: '#eee' },
  btnGhostText: { color: '#2b2b2b', fontWeight: '700' },
  btnTextOnly: { backgroundColor: 'transparent' },
  btnTextOnlyLabel: { color: colors.textMuted ?? '#6B6B6B', textDecorationLine: 'underline', fontWeight: '600' },
});
