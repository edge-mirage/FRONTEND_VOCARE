export function mimeFromPath(path: string) {
  const p = path.toLowerCase();
  if (p.endsWith('.wav')) return { type: 'audio/wav', ext: 'wav' };
  if (p.endsWith('.m4a')) return { type: 'audio/m4a', ext: 'm4a' };
  if (p.endsWith('.mp4')) return { type: 'audio/mp4', ext: 'mp4' };
  if (p.endsWith('.aac')) return { type: 'audio/aac', ext: 'aac' };
  // fallback razonable
  return { type: 'application/octet-stream', ext: 'dat' };
}
