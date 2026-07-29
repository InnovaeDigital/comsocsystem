import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATION_DIR = path.resolve(__dirname, '../../../banco de dados migração');

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => String(value).trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => String(value).trim() !== '')) rows.push(row);
  }

  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header.trim(), values[index] ?? ''])),
  );
}

function foldText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeValue(value) {
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

async function loadCsv(name) {
  const content = await readFile(path.join(MIGRATION_DIR, name), 'utf8');
  return parseCsv(content).map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])),
  );
}

async function loadLegacySeedFromCsv() {
  const [users, categories, notes, presence, activities] = await Promise.all([
    loadCsv('users.csv'),
    loadCsv('categories.csv'),
    loadCsv('notes.csv'),
    loadCsv('presence.csv'),
    loadCsv('activities.csv'),
  ]);

  return {
    users: users.map((row) => ({ ...row, normalized_name: row.normalized_name || foldText(row.name) })),
    categories,
    notes,
    presence,
    activities,
    chatMessages: [],
    remainingOrders: 0,
  };
}

export const LEGACY_SEED = await loadLegacySeedFromCsv().catch(() => ({
  users: [],
  categories: [],
  notes: [],
  presence: [],
  activities: [],
  chatMessages: [],
  remainingOrders: 0,
}));
