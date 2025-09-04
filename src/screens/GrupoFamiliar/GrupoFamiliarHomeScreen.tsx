// src/screens/GrupoFamiliar/GrupoFamiliarHomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {ScrollView, View, StyleSheet, Text, TouchableOpacity, Alert, Platform, Share} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '@/components/Header';
import CardRow from '@/components/CardRow';
import {colors, spacing} from '@/theme';
import {GrupoStackParamList} from '@/navigation/types';
import { StorageService } from '@/services/StorageService';

type Nav = NativeStackNavigationProp<GrupoStackParamList>;

export default function GrupoFamiliarHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [grupoUuid, setGrupoUuid] = useState<string | null>(null);

  useEffect(() => {
    loadGrupoUuid();
  }, []);

  const loadGrupoUuid = async () => {
    try {
      const uuid = await StorageService.getGroupUuid();
      setGrupoUuid(uuid);
    } catch (error) {
      console.error('Error obteniendo grupo_uuid:', error);
    }
  };

  const copyToClipboard = async () => {
    if (!grupoUuid) {
      Alert.alert('Error', 'No hay código de grupo disponible');
      return;
    }

    try {
      // ✅ USAR SHARE API NATIVA COMO ALTERNATIVA
      const shareOptions = {
        title: 'Código del Grupo Familiar',
        message: `Únete a nuestro grupo familiar en VOCARE con este código:\n\n${grupoUuid}\n\nDescarga la app VOCARE e ingresa este código para unirte al grupo.`,
      };

      // Mostrar opciones al usuario
      Alert.alert(
        'Código del Grupo Familiar',
        `${grupoUuid}\n\n¿Qué deseas hacer?`,
        [
          {
            text: 'Compartir',
            onPress: async () => {
              try {
                await Share.share(shareOptions);
              } catch (error) {
                console.error('Error compartiendo:', error);
              }
            },
          },
          {
            text: 'Solo mostrar',
            style: 'cancel',
          },
        ]
      );
      
      console.log('📋 Código del grupo disponible:', grupoUuid);
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert(
        'Código del Grupo Familiar',
        `${grupoUuid}\n\nCopia este código manualmente para compartirlo.`,
        [{ text: 'OK' }]
      );
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
      
      {/* Footer con código del grupo */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>Código del Grupo Familiar</Text>
        <TouchableOpacity 
          style={styles.codeContainer} 
          onPress={copyToClipboard}
          onLongPress={copyToClipboard}
          delayLongPress={500}
          disabled={!grupoUuid}
          activeOpacity={0.7}
        >
          <View style={styles.codeRow}>
            <Text 
              style={styles.codeText}
              selectable={true}
            >
              {grupoUuid ? grupoUuid : 'Cargando...'}
            </Text>
            {grupoUuid && (
              <Ionicons 
                name="copy-outline" 
                size={18} 
                color={colors.primary} 
                style={styles.copyIcon}
              />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.footerHint}>
          Toca para copiar • Mantén presionado para seleccionar
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.xl},
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: colors.text + '99',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: 8,
    minWidth: '80%',
    borderStyle: 'dashed', // Indicar que es seleccionable
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 8,
  },
  copyIcon: {
    marginLeft: 4,
  },
  footerHint: {
    fontSize: 10,
    color: colors.text + '66',
    textAlign: 'center',
    lineHeight: 14,
  },
});
