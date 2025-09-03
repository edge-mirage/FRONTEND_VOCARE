export async function doRefresh() {
  console.log('Refrescando token (mock)');
  return { access_token: 'nuevo-token-mock' };
}
