// src/crud/progress_voices.ts
import api from './auth'; // Usar la instancia autenticada

export interface TasksCompletedResponse {
  user_id: number;
  tasks_completed: Array<number | boolean>;
}

/**
 * GET /tasks-completed/{user_id}
 * Devuelve la lista de tareas completadas del usuario.
 */
export async function getTasksCompleted(userId: number): Promise<TasksCompletedResponse> {
  const res = await api.get<TasksCompletedResponse>(`/tasks-completed/${userId}`);
  return res.data;
}
