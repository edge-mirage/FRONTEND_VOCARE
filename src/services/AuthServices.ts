// src/services/AuthServices.ts
import axios from 'axios';
import StorageService, { StorageService as NamedStorage } from '@/services/StorageService';
import { BASE_URL } from '@/crud/auth'; // ya lo expones ahí

export async function doRefresh() {
  console.log('Refrescando token (mock)');
  return { access_token: 'nuevo-token-mock' };
}

//ESTO ES LA PARTE PARA DEJAR DE MOCKEAR E INTEGRAR...
// src/services/AuthServices.ts
// import axios from 'axios';
// import StorageService from '@/services/StorageService';
// import { BASE_URL } from '@/crud/auth';

// /**
//  * Realiza el refresh de tokens contra el backend y actualiza el storage.
//  * Devuelve el payload crudo del backend (al menos { access_token }).
//  *
//  * Si tu backend NO devuelve refresh_token ni user en el refresh,
//  * se conservan los existentes (condicionales).
//  */
// export async function doRefresh() {
//   const rt = await StorageService.getRefreshToken();
//   if (!rt) throw new Error('No hay refresh token');

//   // Cliente "limpio" SIN interceptores para evitar bucles
//   const client = axios.create({ baseURL: BASE_URL, timeout: 15000 });

//   // ⚠️ Ajusta el body/endpoint si tu API usa otro nombre/camino
//   // p.ej. { refresh: rt } ó header Authorization: Bearer <rt>
//   const { data } = await client.post('/auth/refresh', { refresh_token: rt });

//   if (!data?.access_token) {
//     throw new Error('Refresh inválido: sin access_token');
//   }

//   // Persistencia
//   await StorageService.setAccessToken(data.access_token);
//   if (data.refresh_token) {
//     await StorageService.setRefreshToken(data.refresh_token);
//   }
//   if (data.user) {
//     await StorageService.setUser(data.user);
//     await StorageService.initializeFromUser(data.user);
//   }

//   return data; // { access_token, refresh_token?, user? }
// }
