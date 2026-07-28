import { getPriorityLabel, getWorkflowLabel } from './noteWorkflow';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSummaryRows(summary) {
  return [
    ['Total de atividades', summary.total, '#dbeafe'],
    ['Concluídas', summary.completed, '#dcfce7'],
    ['Em atraso', summary.late, '#fee2e2'],
    ['Em andamento', summary.inProgress, '#e0f2fe'],
  ]
    .map(
      ([label, value, color]) => `
        <tr>
          <td style="background:${color};font-weight:bold;">${escapeHtml(label)}</td>
          <td style="text-align:center;font-weight:bold;">${value}</td>
        </tr>
      `,
    )
    .join('');
}

function buildGeneralBarRows(summary) {
  const safeTotal = Math.max(1, summary.total);

  return [
    ['Concluídas', summary.completed, '#22c55e'],
    ['Em atraso', summary.late, '#ef4444'],
    ['Em andamento', summary.inProgress, '#3b82f6'],
  ]
    .map(([label, value, color]) => {
      const percent = Math.round((value / safeTotal) * 100);
      return `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td>${value}</td>
          <td>
            <div style="width:${Math.max(percent, value > 0 ? 3 : 0)}%;height:14px;background:${color};"></div>
          </td>
          <td>${percent}%</td>
        </tr>
      `;
    })
    .join('');
}

function buildUserRows(summary) {
  const maxUserTotal = Math.max(1, ...summary.users.map((item) => item.total));

  return summary.users
    .map((item) => {
      const percent = Math.round((item.total / maxUserTotal) * 100);
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td style="text-align:center;">${item.total}</td>
          <td style="text-align:center;">${item.completed}</td>
          <td style="text-align:center;">${item.late}</td>
          <td style="text-align:center;">${item.inProgress}</td>
          <td><div style="width:${Math.max(percent, item.total > 0 ? 3 : 0)}%;height:14px;background:#2563eb;"></div></td>
        </tr>
      `;
    })
    .join('');
}

function buildActivityRows(notes, getCategoryObj) {
  return notes
    .map((note) => {
      const catObj = getCategoryObj(note.category);
      const workflowLabel = getWorkflowLabel(note);
      const workflowColor =
        workflowLabel === 'Concluído' ? '#dcfce7' : workflowLabel === 'Em atraso' ? '#fee2e2' : '#e0f2fe';

      return `
        <tr>
          <td>${escapeHtml(note.title)}</td>
          <td>${escapeHtml(catObj.label)}</td>
          <td>${escapeHtml(note.content)}</td>
          <td>${escapeHtml(note.previsao || 'Imediato')}</td>
          <td style="text-align:center;">${note.progresso || 0}%</td>
          <td>${escapeHtml(note.assignedToName || note.creatorName || '')}</td>
          <td>${escapeHtml(getPriorityLabel(note.color))}</td>
          <td style="background:${workflowColor};font-weight:bold;">${workflowLabel}</td>
          <td>${note.createdAt ? new Date(note.createdAt).toLocaleDateString('pt-BR') : ''}</td>
        </tr>
      `;
    })
    .join('');
}

function buildSpreadsheetHtml({ notes, summary, getCategoryObj }) {
  const exportedAt = new Date().toLocaleString('pt-BR');
  const summaryRows = buildSummaryRows(summary);
  const generalBarRows = buildGeneralBarRows(summary);
  const userRows = buildUserRows(summary);
  const activityRows = buildActivityRows(notes, getCategoryObj);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; color: #111827; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
          th, td { border: 1px solid #64748b; padding: 8px; font-size: 12px; vertical-align: top; }
          th { background: #1d4ed8; color: #ffffff; font-weight: bold; text-align: left; }
          .title { background: #0f172a; color: #ffffff; font-size: 18px; font-weight: bold; }
          .subtitle { background: #e2e8f0; font-weight: bold; }
          .section { background: #dbeafe; color: #1e3a8a; font-weight: bold; font-size: 14px; }
        </style>
      </head>
      <body>
        <table>
          <tr><td class="title" colspan="9">Planilha Consolidada de Atividades - Com Soc B Adm QGEx</td></tr>
          <tr><td class="subtitle" colspan="9">Exportado em ${escapeHtml(exportedAt)}</td></tr>
        </table>

        <table>
          <tr><td class="section" colspan="2">Resumo Geral</td></tr>
          ${summaryRows}
        </table>

        <table>
          <tr><td class="section" colspan="4">Gráfico Geral por Situação</td></tr>
          <tr>
            <th>Situação</th>
            <th>Quantidade</th>
            <th>Gráfico</th>
            <th>Percentual</th>
          </tr>
          ${generalBarRows}
        </table>

        <table>
          <tr><td class="section" colspan="6">Resumo por Usuário</td></tr>
          <tr>
            <th>Usuário</th>
            <th>Total</th>
            <th>Concluídas</th>
            <th>Em atraso</th>
            <th>Em andamento</th>
            <th>Gráfico</th>
          </tr>
          ${userRows || '<tr><td colspan="6">Sem atividades cadastradas.</td></tr>'}
        </table>

        <table>
          <tr><td class="section" colspan="9">Atividades</td></tr>
          <tr>
            <th>Título</th>
            <th>Categoria</th>
            <th>Conteúdo</th>
            <th>Previsão</th>
            <th>Progresso</th>
            <th>Responsável</th>
            <th>Prioridade</th>
            <th>Situação</th>
            <th>Data de criação</th>
          </tr>
          ${activityRows || '<tr><td colspan="9">Sem atividades cadastradas.</td></tr>'}
        </table>
      </body>
    </html>
  `;
}

export function exportActivitySpreadsheet({ notes, summary, getCategoryObj }) {
  const html = buildSpreadsheetHtml({ notes, summary, getCategoryObj });
  const blob = new Blob([`\ufeff${html}`], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Planilha-ComSoc-BAdmQGEx-${Date.now()}.xls`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
