import { useState } from 'react';
import { CalendarClock, Clock3, ShieldAlert, Timer } from 'lucide-react';
import { STATUS_MAP } from '../../config/constants';
import { buildDatePrevisao, buildHoursPrevisao, buildMinutesPrevisao } from '../../utils/noteWorkflow';

export function CreateWorkModal({ controller }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadlineMode, setDeadlineMode] = useState('hours');
  const {
    users,
    categories,
    showModal,
    setShowModal,
    notify,
    handleCreateWork,
  } = controller;

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl sm:rounded-[30px] p-5 sm:p-8 shadow-2xl my-4">
            <h2 className="text-md font-black text-white mb-6 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2 font-mono">
              <ShieldAlert className="text-amber-400" size={18} /> Registrar Novo Material de Produção
            </h2>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;

                const form = e.target;
                const title = form.title.value.trim();
                const content = form.content.value.trim();
                const category = form.category.value;
                const previsao = {
                  date: buildDatePrevisao(form.deliveryDate?.value),
                  hours: buildHoursPrevisao(form.deliveryHours?.value),
                  minutes: buildMinutesPrevisao(form.deliveryMinutes?.value),
                }[deadlineMode];
                const progresso = parseInt(form.progresso.value, 10) || 0;
                const color = form.color.value;
                const assignedToUserId = form.assignedToUserId.value;

                if (!title || !content) return;

                setIsSubmitting(true);
                try {
                  const note = await handleCreateWork({
                    title,
                    content,
                    color,
                    category,
                    previsao,
                    progresso,
                    assignedToUserId,
                  });

                  if (note) {
                    setShowModal(false);
                    notify('Novo trabalho registrado no painel!');
                  }
                } catch (error) {
                  console.error('Erro ao registrar trabalho:', error);
                  notify(error.message || 'Não foi possível registrar o trabalho.', 'error');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Título do Trabalho</label>
                <input name="title" required placeholder="Ex: Criação do Banner Digital do Comandante" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Área de Produção</label>
                  <select name="category" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500">
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Criticidade / Status</label>
                  <div className="flex gap-4 p-2 bg-slate-950 border border-slate-800 rounded-xl justify-around h-[50px] items-center">
                    {Object.keys(STATUS_MAP).map((c) => (
                      <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="color" value={c} defaultChecked={c === 'yellow'} className="sr-only peer" />
                        <div className={`w-5 h-5 rounded-full border-2 transition-transform peer-checked:border-white peer-checked:scale-125 ${STATUS_MAP[c].bg}`} title={STATUS_MAP[c].label} />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Responsável pela Execução (opcional)</label>
                <select
                  name="assignedToUserId"
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500"
                >
                  <option value="">Sem responsável definido</option>
                  {users.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}{member.role === 'admin' ? ' (admin)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Especificações / Descrição</label>
                <textarea name="content" required rows={3} placeholder="Escreva os detalhes operacionais da atividade militar..." className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Previsão de Entrega (opcional)</label>
                  <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-800 bg-slate-950 p-2">
                    <button
                      type="button"
                      onClick={() => setDeadlineMode('minutes')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-black uppercase transition-all ${
                        deadlineMode === 'minutes' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <Timer size={13} /> Min
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlineMode('hours')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-black uppercase transition-all ${
                        deadlineMode === 'hours' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <Clock3 size={13} /> Horas
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeadlineMode('date')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-black uppercase transition-all ${
                        deadlineMode === 'date' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <CalendarClock size={13} /> Data
                    </button>
                  </div>

                  {deadlineMode === 'minutes' && (
                    <input
                      type="number"
                      name="deliveryMinutes"
                      min="0"
                      step="1"
                      placeholder="Ex: 30 minutos"
                      className="mt-2 w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all"
                    />
                  )}

                  {deadlineMode === 'hours' && (
                    <input
                      type="number"
                      name="deliveryHours"
                      min="0"
                      step="0.5"
                      placeholder="Ex: 2 horas"
                      className="mt-2 w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all"
                    />
                  )}

                  {deadlineMode === 'date' && (
                    <input
                      type="datetime-local"
                      name="deliveryDate"
                      className="mt-2 w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all"
                    />
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Progresso Inicial (%)</label>
                  <input type="number" name="progresso" min="0" max="100" defaultValue="15" className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl outline-none text-xs text-white focus:ring-2 ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} disabled={isSubmitting} className="flex-1 p-4 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 p-4 rounded-xl font-bold text-xs text-white hover:bg-blue-550 transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
