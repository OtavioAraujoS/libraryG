export function formatPlaytime(minutes: number): string {
  if (minutes <= 0) return "Nunca jogado";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} min jogados`;
  if (remaining === 0) return `${hours}h jogadas`;
  return `${hours}h ${remaining}min jogadas`;
}
