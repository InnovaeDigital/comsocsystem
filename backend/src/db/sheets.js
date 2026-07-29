import { randomUUID } from 'node:crypto';
import { LEGACY_SEED } from '../data/legacy-seed.js';

const JSONBIN_API_BASE = 'https://api.jsonbin.io/v3';
const DEFAULT_COLLECTION = {
  users: [],
  categories: [],
  notes: [],
  chatMessages: [],
  activities: [],
  presence: [],
  remainingOrders: 0,
};

let cachedState = null;
let cacheLoadedAt = 0;

function getConfig() {
  return {
    binId: process.env.JSONBIN_BIN_ID || globalThis.__COMSOC_JSONBIN_BIN_ID__ || '',
    apiKey: process.env.JSONBIN_API_KEY || globalThis.__COMSOC_JSONBIN_API_KEY__ || '',
    accessKey: process.env.JSONBIN_ACCESS_KEY || globalThis.__COMSOC_JSONBIN_ACCESS_KEY__ || '',
    cacheTtlMs: Number(process.env.JSONBIN_CACHE_TTL_MS || 5000),
  };
}

function hasValidRemoteConfig() {
  const { binId, apiKey, accessKey } = getConfig();
  const cleanBinId = String(binId || '').trim();
  return Boolean(cleanBinId && cleanBinId !== 'your_bin_id' && (apiKey || accessKey));
}

function now() {
  return new Date().toISOString();
}

function result(rows = []) {
  return { rows, rowCount: rows.length };
}

function ensureState(record) {
  const state = { ...DEFAULT_COLLECTION, ...(record || {}) };
  for (const key of Object.keys(DEFAULT_COLLECTION)) {
    if (!Array.isArray(DEFAULT_COLLECTION[key]) && typeof state[key] === 'undefined') {
      state[key] = DEFAULT_COLLECTION[key];
    }
  }
  if (!Array.isArray(state.users)) state.users = [];
  if (!Array.isArray(state.categories)) state.categories = [];
  if (!Array.isArray(state.notes)) state.notes = [];
  if (!Array.isArray(state.chatMessages)) state.chatMessages = [];
  if (!Array.isArray(state.activities)) state.activities = [];
  if (!Array.isArray(state.presence)) state.presence = [];
  if (!Number.isFinite(Number(state.remainingOrders))) state.remainingOrders = 0;
  state.remainingOrders = Number(state.remainingOrders);
  return state;
}

function normalizeValue(value) {
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function foldText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeRow(row) {
  return Object.fromEntries(Object.entries(row || {}).map(([key, value]) => [key, normalizeValue(value)]));
}

function normalizeSeedState(state) {
  return {
    ...state,
    users: (state.users || []).map((row) => ({
      ...normalizeRow(row),
      normalized_name: foldText(row.name),
    })),
    categories: (state.categories || []).map(normalizeRow),
    notes: (state.notes || []).map(normalizeRow),
    chatMessages: (state.chatMessages || []).map(normalizeRow),
    activities: (state.activities || []).map(normalizeRow),
    presence: (state.presence || []).map(normalizeRow),
  };
}

function matchesUserName(user, normalizedName) {
  return (
    user.normalized_name === normalizedName ||
    foldText(user.name) === normalizedName ||
    foldText(user.email) === normalizedName
  );
}

function authHeaders() {
  const { apiKey, accessKey } = getConfig();
  const token = apiKey || accessKey;
  if (!token) {
    throw new Error('JSONBin não configurado. Informe JSONBIN_API_KEY ou JSONBIN_ACCESS_KEY.');
  }
  return { 'X-Master-Key': token };
}

async function jsonbinFetch(path, options = {}) {
  const response = await fetch(`${JSONBIN_API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Falha ao acessar JSONBin: ${response.status} ${text}`);
  }

  return response;
}

async function loadState() {
  const { binId, cacheTtlMs } = getConfig();
  if (!hasValidRemoteConfig()) {
    cachedState = ensureState(normalizeSeedState(LEGACY_SEED));
    cacheLoadedAt = Date.now();
    return cachedState;
  }
  if (cachedState && Date.now() - cacheLoadedAt < cacheTtlMs) return cachedState;

  try {
    const response = await jsonbinFetch(`/b/${binId}/latest`, { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    const record = payload.record || payload;
    cachedState = ensureState(record);
    cacheLoadedAt = Date.now();
    return cachedState;
  } catch (error) {
    cachedState = ensureState(normalizeSeedState(LEGACY_SEED));
    cacheLoadedAt = Date.now();
    return cachedState;
  }
}

async function saveState(state) {
  const { binId } = getConfig();
  if (!hasValidRemoteConfig()) {
    cachedState = ensureState(state);
    cacheLoadedAt = Date.now();
    return;
  }
  try {
    await jsonbinFetch(`/b/${binId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    cachedState = ensureState(state);
    cacheLoadedAt = Date.now();
  } catch {
    cachedState = ensureState(state);
    cacheLoadedAt = Date.now();
  }
}

function normalized(sql) {
  return String(sql).replace(/\s+/g, ' ').trim().toLowerCase();
}

function userById(state, id) {
  return state.users.find((user) => user.id === id) || null;
}

function noteWithAssignee(state, note) {
  const assignee = userById(state, note.assigned_to);
  return {
    ...note,
    assigned_to_name: assignee?.name || null,
    assigned_to_color: assignee?.color || null,
  };
}

function updateFields(row, sql, params) {
  const setPart = sql.match(/ set (.+) where /i)?.[1] || '';
  const assignments = setPart.split(',').map((item) => item.trim());
  for (const assignment of assignments) {
    const match = assignment.match(/^([a-z_]+) = \$(\d+)$/i);
    if (match) row[match[1]] = params[Number(match[2]) - 1];
  }
  row.updated_at = now();
  return row;
}

function parseCount(value) {
  return Number(value || 0) || 0;
}

export async function query(sql, params = []) {
  const statement = normalized(sql);
  const state = await loadState();

  if (statement.startsWith('select notes.*')) {
    return result([...state.notes].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((note) => noteWithAssignee(state, note)));
  }
  if (statement === 'select * from users order by is_owner desc, role asc, name asc') {
    return result([...state.users].sort((a, b) => Number(b.is_owner) - Number(a.is_owner) || a.role.localeCompare(b.role) || a.name.localeCompare(b.name)));
  }
  if (statement === 'select * from categories order by created_at asc, key asc') return result([...state.categories].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.key.localeCompare(b.key)));
  if (statement === 'select * from presence order by last_seen desc') return result([...state.presence].sort((a, b) => b.last_seen.localeCompare(a.last_seen)));
  if (statement.includes('from chat_messages order by created_at desc limit 50')) return result([...state.chatMessages].sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(-50));
  if (statement === 'select * from activities order by created_at desc limit 15') return result([...state.activities].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 15));
  if (statement.startsWith('select * from users where normalized_name')) {
    return result(state.users.filter((user) => matchesUserName(user, params[0])).sort((a, b) => Number(b.is_owner) - Number(a.is_owner)).slice(0, 1));
  }
  if (statement === 'select * from users where id = $1') return result(state.users.filter((user) => user.id === params[0]));
  if (statement.startsWith('select id from users where normalized_name')) return result(state.users.filter((user) => matchesUserName(user, params[0]) && (!params[1] || user.id !== params[1])).map((user) => ({ id: user.id })));
  if (statement === 'select count(*)::int as total from users') return result([{ total: state.users.length }]);
  if (statement === 'select * from notes where id = $1') return result(state.notes.filter((note) => note.id === params[0]));
  if (statement === 'select remaining_orders from settings limit 1') return result([{ remaining_orders: parseCount(state.remainingOrders) }]);

  if (statement.startsWith('insert into users')) {
    const user = { id: randomUUID(), name: params[0], normalized_name: params[1], email: params[2], color: params[3], role: statement.includes("'admin', true") ? 'admin' : params[4], is_owner: statement.includes("'admin', true"), created_by: statement.includes("'admin', true") ? null : params[5], admin_granted_by: statement.includes("'admin', true") ? null : params[6], created_at: now(), updated_at: now() };
    state.users.push(user); await saveState(state); return result([user]);
  }
  if (statement.startsWith('insert into presence')) {
    const existing = state.presence.find((entry) => entry.email === params[0]);
    const presence = { email: params[0], uid: params[1], name: params[2], color: params[3], last_seen: now() };
    if (existing) Object.assign(existing, presence); else state.presence.push(presence);
    await saveState(state); return result();
  }
  if (statement.startsWith('insert into activities')) {
    const activity = { id: randomUUID(), user_name: params[0], user_email: params[1], user_color: params[2], action: params[3], created_at: now() };
    state.activities.push(activity); await saveState(state); return result([activity]);
  }
  if (statement.startsWith('insert into notes')) {
    const note = { id: randomUUID(), title: params[0], content: params[1], color: params[2], category_key: params[3], previsao: params[4], progresso: params[5], creator_name: params[6], creator_email: params[7], created_by: params[8], assigned_to: params[9], last_edited_by: null, created_at: now(), updated_at: now() };
    state.notes.push(note); await saveState(state); return result([note]);
  }
  if (statement.startsWith('insert into categories')) {
    let category = state.categories.find((item) => item.key === params[0]);
    if (category) Object.assign(category, { label: params[1], icon_name: params[2], bg: params[3] });
    else { category = { key: params[0], label: params[1], icon_name: params[2], bg: params[3], created_at: now() }; state.categories.push(category); }
    await saveState(state); return result([category]);
  }
  if (statement.startsWith('insert into chat_messages')) {
    const message = { id: randomUUID(), sender_name: params[0], sender_email: params[1], sender_color: params[2], text: params[3], created_at: now() };
    state.chatMessages.push(message); await saveState(state); return result([message]);
  }
  if (statement.startsWith('update users set')) {
    const user = userById(state, params.at(-1)); if (!user) return result(); updateFields(user, sql, params); await saveState(state); return result([user]);
  }
  if (statement.startsWith('update notes set')) {
    const note = state.notes.find((item) => item.id === params.at(-1)); if (!note) return result(); updateFields(note, sql, params); await saveState(state); return result([noteWithAssignee(state, note)]);
  }
  if (statement.startsWith('update categories set')) {
    const category = state.categories.find((item) => item.key === params[0]); if (!category) return result(); Object.assign(category, { label: params[1], icon_name: params[2], bg: params[3] }); await saveState(state); return result([category]);
  }
  if (statement.startsWith('update settings set remaining_orders')) {
    state.remainingOrders = parseCount(params[0]); await saveState(state); return result([{ remaining_orders: state.remainingOrders }]);
  }
  if (statement.startsWith('delete from presence')) { state.presence = state.presence.filter((entry) => entry.uid !== params[0] && entry.email !== params[1]); await saveState(state); return result(); }
  if (statement.startsWith('delete from users')) { const index = state.users.findIndex((user) => user.id === params[0]); if (index < 0) return result(); const [user] = state.users.splice(index, 1); await saveState(state); return result([user]); }
  if (statement.startsWith('delete from notes')) { const index = state.notes.findIndex((note) => note.id === params[0]); if (index < 0) return result(); const [note] = state.notes.splice(index, 1); await saveState(state); return result([statement.includes('returning id') ? { id: note.id } : note]); }
  if (statement.startsWith('delete from categories')) { const index = state.categories.findIndex((category) => category.key === params[0]); if (index < 0) return result(); const [category] = state.categories.splice(index, 1); await saveState(state); return result([{ key: category.key }]); }

  throw new Error(`Consulta não suportada pelo armazenamento JSONBin: ${statement}`);
}

export const pool = { end: () => Promise.resolve() };
