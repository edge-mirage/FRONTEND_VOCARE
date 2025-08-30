// src/crud/schedule.ts
import axios from 'axios';
import type { ScheduledCall, Weekday } from '@/domain/schedule/types';

const useLocalServer = true;
const LOCAL_URL = 'http://10.0.2.2:8000';
const PROD_URL = 'https://tu-servidor.com';
export const URL = useLocalServer ? LOCAL_URL : PROD_URL;

// ====== Tipos que devuelve/espera el backend ======
export type ApiScheduledCall = {
  id: number;
  family_group_id: string;
  context: string;
  date: string | null;          // 'YYYY-MM-DD' o null
  hour: string;                 // 'HH:MM:SS'
  voice_id: number | null;
  days: number[] | null;        // int4[7] con 0/1 o null
  duration: number;             // minutos
  active: boolean;              // ← NUEVO
};
export type ApiScheduledCallCreate = Omit<ApiScheduledCall, 'id'>;
export type ApiScheduledCallPatch = Partial<Omit<ApiScheduledCall, 'id' | 'family_group_id'>>;

// ====== Helpers de conversión ======
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const daysFlagsToWeekdays = (flags: number[]): Weekday[] =>
  (flags || []).reduce<Weekday[]>((acc, v, i) => (v === 1 ? [...acc, i as Weekday] : acc), []);

const weekdaysToDaysFlags = (days: Weekday[]): number[] => {
  const out = Array(7).fill(0);
  days.forEach(d => { out[d] = 1; });
  return out;
};

const composeLocalISO = (hour: string, dISO?: string) => {
  // Construye un Date con hora local (y fecha si viene) y lo serializa a ISO
  const d = dISO ? new Date(dISO + 'T00:00:00') : new Date();
  const [h, m] = hour.split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
};

const extractHour = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

// ---- API -> UI
export const apiToUI = (row: ApiScheduledCall): ScheduledCall => {
  const isOneOff = !!row.date;
  const timeISO = composeLocalISO(row.hour, row.date ?? undefined);

  return {
    id: String(row.id),
    timeISO,
    repeat: isOneOff
      ? { type: 'oneoff', dateISO: row.date! }
      : { type: 'weekly', days: daysFlagsToWeekdays(row.days ?? [0,0,0,0,0,0,0]) },
    note: row.context ?? '',
    durationMin: row.duration,
    voiceId: row.voice_id != null ? String(row.voice_id) : undefined,
    active: row.active, // ← NUEVO (ya no hardcodeado)
  };
};

// ---- UI -> API (create)
export const uiToApiCreate = (
  payload: Omit<ScheduledCall, 'id'>,
  family_group_id: string
): ApiScheduledCallCreate => {
  const hour = extractHour(payload.timeISO);

  if (payload.repeat.type === 'weekly') {
    const flags = weekdaysToDaysFlags(payload.repeat.days);
    return {
      family_group_id,
      context: payload.note ?? '',
      date: null,
      hour,
      voice_id: payload.voiceId ? Number(payload.voiceId) : null,
      days: flags,
      duration: payload.durationMin,
      active: payload.active, // ← NUEVO
    };
  } else {
    return {
      family_group_id,
      context: payload.note ?? '',
      date: payload.repeat.dateISO,
      hour,
      voice_id: payload.voiceId ? Number(payload.voiceId) : null,
      days: null,
      duration: payload.durationMin,
      active: payload.active, // ← NUEVO
    };
  }
};

// ---- UI -> API (update/patch)  **sin** family_group_id
export const uiToApiPatch = (
  payload: Omit<ScheduledCall, 'id'>
): ApiScheduledCallPatch => {
  const hour = extractHour(payload.timeISO);

  if (payload.repeat.type === 'weekly') {
    const flags = weekdaysToDaysFlags(payload.repeat.days);
    return {
      context: payload.note ?? '',
      date: null,
      hour,
      voice_id: payload.voiceId ? Number(payload.voiceId) : null,
      days: flags,
      duration: payload.durationMin,
      active: payload.active, // ← NUEVO
    };
  } else {
    return {
      context: payload.note ?? '',
      date: payload.repeat.dateISO,
      hour,
      voice_id: payload.voiceId ? Number(payload.voiceId) : null,
      days: null,
      duration: payload.durationMin,
      active: payload.active, // ← NUEVO
    };
  }
};

// =================== ENDPOINTS ===================
export const listSchedulesByGroup = async (group_uuid: string): Promise<ApiScheduledCall[]> => {
  const res = await axios.get(`${URL}/api/schedule-calls/group/${group_uuid}`);
  return res.data;
};

export const createSchedule = async (data: ApiScheduledCallCreate): Promise<ApiScheduledCall> => {
  const res = await axios.post(`${URL}/api/schedule-calls`, data);
  return res.data;
};

export const updateSchedule = async (id: number, data: ApiScheduledCallPatch): Promise<ApiScheduledCall> => {
  const res = await axios.put(`${URL}/api/schedule-calls/${id}`, data);
  return res.data;
};

export const deleteSchedule = async (id: number) => {
  const res = await axios.delete(`${URL}/api/schedule-calls/${id}`);
  return res.data;
};
