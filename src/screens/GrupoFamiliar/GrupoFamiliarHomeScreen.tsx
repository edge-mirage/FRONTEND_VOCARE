// src/screens/GrupoFamiliar/GrupoFamiliarHomeScreen.tsx
import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {GrupoStackParamList} from '@/navigation/types';

type Nav = NativeStackNavigationProp<GrupoStackParamList>;

export default function GrupoFamiliarHomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <Header title="Grupo Familiar" onInfoPress={() => { /* abrir modal info */ }} />
      <ScrollView contentContainerStyle={styles.content}>
        <CardRow
          icon="ban-outline"
          title="Opcion 1"
          subtitle="Hay que diseñar bien esto"
          onPress={() => navigation.navigate('OPCION1')}
        />
        <View style={{height: spacing.lg}} />
        <CardRow
          icon="ban-outline"
          title="Opcion 2"
          subtitle="Hay que diseñar bien esto"
          onPress={() => navigation.navigate('OPCION2')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
});
