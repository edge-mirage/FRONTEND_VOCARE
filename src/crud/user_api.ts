import api from '@/crud/auth'; // tu instancia con interceptores

export interface CaregiverRoleBody {
  is_primary: boolean;
}

// BACKEND REAL
export async function setCaregiverRole(body: CaregiverRoleBody) {
  const { data } = await api.post('/users/caregiver-role', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
}
