// src/domain/schedule/types.ts
export type Weekday = 0|1|2|3|4|5|6; // 0=Dom, 1=Lun, ...
export type Repeat =
  | { type: 'weekly'; days: Weekday[] }            // L M X J V S D
  | { type: 'oneoff'; dateISO: string };           // fecha concreta (YYYY-MM-DD)

export interface ScheduledCall {
  id: string;
  timeISO: string;      // Hora en ISO "HH:mm" o "YYYY-MM-DDTHH:mm:ssZ"
  repeat: Repeat;
  note?: string;
  active: boolean;
}