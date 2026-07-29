import { describe, expect, it } from 'vitest';
import {
  buildDatePrevisao,
  buildHoursPrevisao,
  buildMinutesPrevisao,
  getCountdownInfo,
  getNoteWorkflowStatus,
  parseDueTimestamp,
  WORKFLOW_STATUS,
} from './noteWorkflow';

describe('getNoteWorkflowStatus', () => {
  it('marca como concluída quando o progresso chega a 100%', () => {
    expect(getNoteWorkflowStatus({ progresso: 100, previsao: '10 dias' })).toBe(WORKFLOW_STATUS.completed);
  });

  it('marca como em atraso quando o prazo já passou', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();
    const now = new Date('2026-06-03T12:00:00Z').getTime();

    expect(getNoteWorkflowStatus({ progresso: 40, previsao: '1 dia', createdAt }, now)).toBe(WORKFLOW_STATUS.late);
  });

  it('mantém em andamento quando ainda não concluiu e não atrasou', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();
    const now = new Date('2026-06-02T12:00:00Z').getTime();

    expect(getNoteWorkflowStatus({ progresso: 40, previsao: '5 dias', createdAt }, now)).toBe(WORKFLOW_STATUS.inProgress);
  });

  it('calcula prazo por quantidade de horas a partir da criação', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();

    expect(parseDueTimestamp({ previsao: buildHoursPrevisao('2'), createdAt })).toBe(createdAt + 2 * 60 * 60 * 1000);
  });

  it('calcula prazo por quantidade de minutos a partir da criação', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();

    expect(parseDueTimestamp({ previsao: buildMinutesPrevisao('30'), createdAt })).toBe(createdAt + 30 * 60 * 1000);
  });

  it('calcula prazo por data e hora final', () => {
    const previsao = buildDatePrevisao('2026-06-01T15:30');

    expect(parseDueTimestamp({ previsao })).toBe(new Date('2026-06-01T15:30').getTime());
  });
});

describe('getCountdownInfo', () => {
  it('mostra contador regressivo para prazo em horas', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();
    const now = createdAt + 30 * 60 * 1000;

    expect(getCountdownInfo({ previsao: buildHoursPrevisao('2'), createdAt }, now).label).toBe('1h 30min 0s');
  });

  it('marca prazo encerrado quando os minutos acabam sem concluir', () => {
    const createdAt = new Date('2026-06-01T12:00:00Z').getTime();
    const now = createdAt + 31 * 60 * 1000;

    expect(getCountdownInfo({ previsao: buildMinutesPrevisao('30'), createdAt, progresso: 20 }, now)).toEqual({
      label: 'Prazo encerrado',
      tone: 'late',
    });
  });
});
