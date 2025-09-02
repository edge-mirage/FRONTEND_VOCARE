// src/domain/schedule/types.ts
export type Weekday = 0|1|2|3|4|5|6; // 0=Dom

export type Repeat =
  | { type: 'weekly'; days: Weekday[] }
  | { type: 'oneoff'; dateISO: string }; // YYYY-MM-DD

export interface ScheduledCall {
  id: string;
  timeISO: string;
  repeat: Repeat;

  // NUEVO
  note?: string;          // "Contexto" en texto libre
  contextId?: string;     // si lo eliges desde una lista
  durationMin: number;    // 5..30
  voiceId?: string;       // id de la voz

  active: boolean;
}
