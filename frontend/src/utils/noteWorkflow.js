const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEADLINE_PREFIX = 'deadline:';
const HOURS_PREFIX = 'hours:';
const MINUTES_PREFIX = 'minutes:';

export const WORKFLOW_STATUS = Object.freeze({
  completed: 'completed',
  late: 'late',
  inProgress: 'inProgress',
});

export function buildDatePrevisao(value) {
  if (!value) return 'Sem prazo';

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'Sem prazo';

  return `${DEADLINE_PREFIX}${new Date(timestamp).toISOString()}`;
}

export function buildHoursPrevisao(value) {
  const hours = Number.parseFloat(String(value || '').replace(',', '.'));
  if (!Number.isFinite(hours) || hours <= 0) return 'Sem prazo';

  return `${HOURS_PREFIX}${hours}`;
}

export function buildMinutesPrevisao(value) {
  const minutes = Number.parseFloat(String(value || '').replace(',', '.'));
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Sem prazo';

  return `${MINUTES_PREFIX}${minutes}`;
}

export function parseDueTimestamp(note) {
  const rawPrevisao = String(note.previsao || '').trim();
  const normalizedPrevisao = rawPrevisao.toLowerCase();
  const createdAt = note.createdAt || Date.now();

  if (!normalizedPrevisao || normalizedPrevisao.includes('sem prazo')) return null;

  if (normalizedPrevisao.startsWith(DEADLINE_PREFIX)) {
    const timestamp = new Date(rawPrevisao.slice(DEADLINE_PREFIX.length)).getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (normalizedPrevisao.startsWith(HOURS_PREFIX)) {
    const hours = Number.parseFloat(normalizedPrevisao.slice(HOURS_PREFIX.length));
    return Number.isFinite(hours) ? createdAt + hours * HOUR_MS : null;
  }

  if (normalizedPrevisao.startsWith(MINUTES_PREFIX)) {
    const minutes = Number.parseFloat(normalizedPrevisao.slice(MINUTES_PREFIX.length));
    return Number.isFinite(minutes) ? createdAt + minutes * 60 * 1000 : null;
  }

  const isoDate = normalizedPrevisao.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59).getTime();
  }

  const brDate = normalizedPrevisao.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (brDate) {
    const [, day, month, year] = brDate;
    const normalizedYear = Number(year.length === 2 ? `20${year}` : year);
    return new Date(normalizedYear, Number(month) - 1, Number(day), 23, 59, 59).getTime();
  }

  if (normalizedPrevisao.includes('imediato') || normalizedPrevisao.includes('hoje')) {
    return createdAt + DAY_MS;
  }

  if (normalizedPrevisao.includes('amanha') || normalizedPrevisao.includes('amanhã')) {
    return createdAt + DAY_MS;
  }

  const numericValue = Number.parseFloat(normalizedPrevisao.replace(',', '.'));
  if (Number.isNaN(numericValue)) return null;

  if (normalizedPrevisao.includes('min')) return createdAt + numericValue * 60 * 1000;
  if (normalizedPrevisao.includes('hora') || normalizedPrevisao.includes('hr')) return createdAt + numericValue * HOUR_MS;
  if (normalizedPrevisao.includes('semana')) return createdAt + numericValue * 7 * DAY_MS;

  return createdAt + numericValue * DAY_MS;
}

export function getDueLabel(note) {
  const rawPrevisao = String(note.previsao || '').trim();
  const normalizedPrevisao = rawPrevisao.toLowerCase();

  if (!normalizedPrevisao || normalizedPrevisao.includes('sem prazo')) return 'Sem prazo definido';

  if (normalizedPrevisao.startsWith(DEADLINE_PREFIX)) {
    const timestamp = new Date(rawPrevisao.slice(DEADLINE_PREFIX.length)).getTime();
    if (Number.isNaN(timestamp)) return 'Sem prazo definido';

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  }

  if (normalizedPrevisao.startsWith(HOURS_PREFIX)) {
    const hours = Number.parseFloat(normalizedPrevisao.slice(HOURS_PREFIX.length));
    if (!Number.isFinite(hours)) return 'Sem prazo definido';

    return `${hours.toLocaleString('pt-BR')} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  if (normalizedPrevisao.startsWith(MINUTES_PREFIX)) {
    const minutes = Number.parseFloat(normalizedPrevisao.slice(MINUTES_PREFIX.length));
    if (!Number.isFinite(minutes)) return 'Sem prazo definido';

    return `${minutes.toLocaleString('pt-BR')} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  return rawPrevisao;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h ${minutes}min ${seconds}s`;
  return `${minutes}min ${seconds}s`;
}

export function getCountdownInfo(note, now = Date.now()) {
  if ((note.progresso || 0) >= 100) {
    return {
      label: 'Concluído',
      tone: 'completed',
    };
  }

  const dueTimestamp = parseDueTimestamp(note);
  if (!dueTimestamp) {
    return {
      label: 'Sem contador',
      tone: 'neutral',
    };
  }

  const remaining = dueTimestamp - now;
  if (remaining <= 0) {
    return {
      label: 'Prazo encerrado',
      tone: 'late',
    };
  }

  return {
    label: formatDuration(remaining),
    tone: remaining <= HOUR_MS ? 'warning' : 'active',
  };
}

export function getNoteWorkflowStatus(note, now = Date.now()) {
  if ((note.progresso || 0) >= 100) return WORKFLOW_STATUS.completed;

  const dueTimestamp = parseDueTimestamp(note);
  if (dueTimestamp && dueTimestamp < now) return WORKFLOW_STATUS.late;

  return WORKFLOW_STATUS.inProgress;
}

export function getWorkflowLabel(note) {
  const status = getNoteWorkflowStatus(note);
  if (status === WORKFLOW_STATUS.completed) return 'Concluído';
  if (status === WORKFLOW_STATUS.late) return 'Em atraso';
  return 'Em andamento';
}

export function getPriorityLabel(color) {
  if (color === 'red') return 'Crítico / Urgente';
  if (color === 'blue') return 'Em execução / Concluído';
  return 'Planejamento / Ideia';
}
