// src/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';


export type HomeStackParamList = {
  AppHome: undefined;
  Cuenta: undefined;
  Configuracion: undefined;
};

export type RegistroStackParamList = {
  RegistroScreen: undefined;
  RegistroCuidadorOne: { grupo_uuid?: string } | undefined;
  RegistroDatosPaciente: { grupo_uuid?: string } | undefined;
  RegistroSolicitaGUID: { grupo_uuid?: string } | undefined;
  RegistroSintomasPaciente: { grupo_uuid?: string; paciente_id?: number } | undefined;
};


export type PacienteStackParamList = {
  PacienteHome: undefined;
  PerfilPaciente: undefined;
  Sintomas: undefined;
  Intereses: undefined;
  Eventos: undefined;
};

export type LlamadaStackParamList = {
  LlamadaHome: undefined;
  LlamadaInstantanea: undefined;
  LlamadaRapida: undefined;
  AgendarLlamada: undefined;
  ContextosDeLlamada: undefined;
};

export type GrupoStackParamList = {
  GrupoFamiliarHome: undefined;
  OPCION1: undefined;
  OPCION2: undefined;
};

// src/navigation/types.ts
export type ReplicacionStackParamList = {
  ReplicacionHome: undefined;
  Informacion: undefined;
  Replicacion: { justRecorded?: boolean } | undefined; // ← permite el flag
  VocesRegistradas: undefined;
  ReconocimientoVoz: { reset?: boolean } | undefined;
  FoneticaPalabras: undefined;
  VivaWanderers: undefined;
  ReplicacionScreenSure: {
    audio: { uri: string; durationSec: number; createdAt: number };
  };
};


export type MainTabParamList = {
  PacienteTab: undefined;
  HomeTab: undefined;
  LlamadasTab: undefined;
  GrupoTab: undefined;
  ReplicacionTab: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  RecoverPassword: undefined;
  VerifyCode: { email: string; newPassword: string };
  MainTabs: undefined;
  HomeStack: undefined;

  RegistroStack: NavigatorScreenParams<RegistroStackParamList>;
};