// // src/screens/Replicaciones/InformacionScreen.tsx
// import React from 'react';
// import {View, Text, Button} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import type { ReplicacionStackParamList } from '@/navigation/types';
// import Header from '@/components/Header';
// import {colors, spacing} from '@/theme';


// type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'Informacion'>;

// export default function InformacionScreen() {
//   const navigation = useNavigation<Nav>();


//   return (
//     <View style={{flex:1, backgroundColor: colors.background}}>
//       <Header title="Información Replicación" />
//       <View style={{padding: spacing.xl}}>
//         <Text>¿Cómo funciona la replicación de voz?</Text>

//         <Text style={{marginTop: spacing.sm}}>
//           Aquí va la info del procedimiento: requisitos, duración estimada, consejos de grabación, privacidad, etc. (lorem ipsum…) </Text>
//       </View>
//       <View style={{padding: spacing.xl}}>
//         <Button title="Comenzar replicación" onPress={() => navigation.navigate('Replicacion' as never)} />
//     </View>
//   </View>
//   );
//   }

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Header from '@/components/Header';
import { colors, spacing } from '@/theme';
import type { ReplicacionStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<ReplicacionStackParamList, 'Informacion'>;

export default function InformacionScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="Información Replicación" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>¿Cómo funciona la replicación de voz?</Text>

        <Text style={styles.body}>
          Aquí va un poco como funciona nuestra replicación de voz, explaya
          temáticas como las IA’s utilizadas y podría redirigir a términos
          y condiciones.
        </Text>

        <Pressable
          style={styles.cta}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          onPress={() => navigation.navigate('Replicacion')}
        >
          <Text style={styles.ctaText}>COMENZAR REPLICACIÓN</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary,       // morado del mock
    marginBottom: spacing.md,
  },
  body: {
    color: colors.text,
    opacity: 0.8,                // gris suave
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  cta: {
    alignSelf: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    // sombra sutil
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
