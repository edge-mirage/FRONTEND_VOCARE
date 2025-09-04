// src/navigation/types.ts

import type { ScheduledCall } from '@/domain/schedule/types';

export type HomeStackParamList = {
  AppHome: undefined;
  Cuenta: undefined;
  Configuracion: undefined;
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
  LlamadaInstantanea: { voiceName?: string; voiceId?: string; number?: string } | undefined;
  LlamadaActiva: { voiceName?: string | undefined; voiceId?: string; number?: string | undefined; pacientId: number; contextItemId: number };
  LlamadaRapida: undefined;
  AgendarLlamada: undefined;
  ContextosDeLlamada: undefined;

  LlamadaEditor: {
    initial?: ScheduledCall; // si viene, es edición; si no, es creación
    // pasamos un callback para reportar el resultado al volver
    onSubmit: (payload: Omit<ScheduledCall, 'id'>, id?: string) => void;
  };
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
  TareaLectura: { taskIndex: number };
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
  VerifyCode: {
    email: string;
    newPassword: string;
  };
  MainTabs: undefined;
  HomeStack: undefined;
  Registro: undefined;
};