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
  LlamadaInstantanea: undefined;
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

export type ReplicacionStackParamList = {
  ReplicacionHome: undefined;
  Informacion: undefined;
  Replicacion: undefined;
  VocesRegistradas: undefined;
};

export type MainTabParamList = {
  PacienteTab: undefined;
  LlamadasTab: undefined;
  GrupoTab: undefined;
  ReplicacionTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  HomeStack: undefined;
};