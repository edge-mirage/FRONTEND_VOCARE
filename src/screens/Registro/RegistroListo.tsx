// src/screens/RegistroListo.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Ajusta el color primario según tu tema
const PRIMARY = '#400D46';


type RootStackParamList = {
  Login: undefined;

};

type RegistroListoScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function RegistroListoScreen({ navigation }: RegistroListoScreenProps) {
  const nombrePaciente = 'NOMBRE_PACIENTE';
  const codigoGrupo = '#DDDDDD';

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/images/logo-light.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.titulo}>¡Todo Listo!</Text>
      <Text style={styles.subtitulo}>
        Ya acabas de crear tu grupo familiar!
      </Text>

      <View style={styles.infoList}>
        <View style={styles.infoItem}>
          <Text style={styles.emoji}>👑</Text>
          <View>
            <Text style={styles.infoTitle}>Eres un/a administrador/a</Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.emoji}>👥</Text>
          <View>
            <Text style={styles.infoTitle}>Invita personas de confianza</Text>
            <Text style={styles.infoDesc}>
              Familiares o amigos que deseen estar al pendiente de la persona cuidada
            </Text>
          </View>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.emoji}>💜</Text>
          <View>
            <Text style={styles.infoTitle}>Acompaña con cariño y cuidado con Vocare</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.btnText}>¡Listo!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7FC',
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrapper: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
  },
  titulo: {
    fontSize: 26,
    color: PRIMARY,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 15,
    color: PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoList: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  emoji: {
    fontSize: 32,
    marginRight: 10,
    marginTop: 0,
    width: 38,
    textAlign: 'center',
  },
  infoTitle: {
    fontWeight: 'bold',
    color: PRIMARY,
    fontSize: 16,
  },
  infoDesc: {
    color: PRIMARY,
    fontSize: 13,
    marginTop: 2,
  },
  btn: {
    width: '100%',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
