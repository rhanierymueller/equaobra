/**
 * Formats an ISO date string (YYYY-MM-DD) to the Brazilian format DD/MM/YYYY.
 * Returns '—' for empty or invalid input.
 */
export function formatDate(iso: string): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
