// src/screens/GrupoFamiliar/GrupoFamiliarHomeScreen.tsx
import React, {useState, useEffect} from 'react';
import {ScrollView, View, StyleSheet, Text, TouchableOpacity, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {GrupoStackParamList} from '@/navigation/types';
import {StorageService} from '@/services/StorageService';

type Nav = NativeStackNavigationProp<GrupoStackParamList>;

export default function GrupoFamiliarHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [groupUuid, setGroupUuid] = useState<string | null>(null);

  useEffect(() => {
    const loadGroupUuid = async () => {
      try {
        const uuid = await StorageService.getGroupUuid();
        setGroupUuid(uuid);
      } catch (error) {
        console.error('Error cargando UUID del grupo:', error);
      }
    };

    loadGroupUuid();
  }, []);

  const copyToClipboard = () => {
    if (groupUuid) {
      Clipboard.setString(groupUuid);
      Alert.alert('Copiado', 'UUID del grupo copiado al portapapeles');
    } else {
      Alert.alert('Error', 'No hay UUID disponible para copiar');
    }
  };

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
      
      {/* Footer con UUID */}
      {groupUuid && (
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>ID del Grupo:</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.uuidContainer}>
            <Text style={styles.uuidText} numberOfLines={1}>
              {groupUuid}
            </Text>
            <Text style={styles.copyHint}>Toca para copiar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl, paddingBottom: spacing.lg},
  footer: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  uuidContainer: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  uuidText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
  },
  copyHint: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
