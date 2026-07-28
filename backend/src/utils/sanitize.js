export function clampProgress(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

export function sanitizeCategoryKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

export function requireText(value, fieldName, maxLength = 5000) {
  const text = String(value || '').trim();
  if (!text) {
    const error = new Error(`Campo obrigatório: ${fieldName}`);
    error.status = 400;
    throw error;
  }
  return text.slice(0, maxLength);
}

export const categoryColorMap = {
  purple: 'bg-purple-950/90 text-purple-300 border border-purple-500/30',
  cyan: 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/30',
  emerald: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30',
  indigo: 'bg-indigo-950/90 text-indigo-300 border border-indigo-500/30',
  rose: 'bg-rose-950/90 text-rose-300 border border-rose-500/30',
  amber: 'bg-amber-950/90 text-amber-300 border border-amber-500/30',
};
