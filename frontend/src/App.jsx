import { useMemo, useState } from 'react';
import { AlertTriangle, LogOut, Shield, Users } from 'lucide-react';
import { useComsocController } from './hooks/useComsocController';

function StatCard({ label, value, tone = 'slate' }) {
  const toneMap = {
    slate: 'border-white/10 bg-white/5 text-slate-300',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    blue: 'border-blue-400/20 bg-blue-400/10 text-blue-100',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  };

  return (
    <article className={`rounded-2xl border p-4 ${toneMap[tone] || toneMap.slate}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function LoginPanel({ controller }) {
  const [name, setName] = useState('');

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <section className="surface-card w-full max-w-4xl overflow-hidden rounded-[32px]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden p-8 sm:p-10 lg:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_30%)]" />
            <div className="relative space-y-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                <Shield size={13} /> Acesso operacional
              </span>
              <div className="space-y-4">
                <h1 className="max-w-xl text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
                  Painel de comunicação visual, drones e audiovisual
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  O sistema foi refeito para priorizar estabilidade. Primeiro fazemos login e validamos a base antiga;
                  depois reintroduzimos o painel completo em camadas, sem depender de módulos que possam travar a tela.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Comunicação Visual', 'Organização de demandas, artes e sinalização.'],
                  ['Design Gráfico', 'Fluxos para criação, revisão e entrega.'],
                  ['Drones', 'Planejamento de captação e acompanhamento.'],
                  ['Audiovisual', 'Foto, vídeo e finalização em um único lugar.'],
                ].map(([title, text]) => (
                  <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">{title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center p-6 sm:p-8 lg:p-12">
            <div className="w-full rounded-[28px] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40">
              <div className="mb-8 space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 p-[1px]">
                  <div className="flex h-full w-full items-center justify-center rounded-[21px] bg-slate-950">
                    <span className="text-sm font-black tracking-[0.35em] text-white">CS</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">Entrar no sistema</h2>
                <p className="text-xs text-slate-400">Use o nome funcional reconhecido na base migrada.</p>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const typedName = name.trim();
                  if (!typedName) return;
                  try {
                    await controller.setProfile({ name: typedName });
                  } catch (error) {
                    controller.notify(error.message || 'Não foi possível autenticar.', 'error');
                  }
                }}
              >
                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Nome funcional
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ex: Cb Tomé"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/[0.08]"
                  />
                </label>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-900/20 transition-transform hover:-translate-y-0.5"
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ controller }) {
  const { profile, users, notes, categories, remainingOrders, isAdmin, setProfile, notify } = controller;
  const metrics = useMemo(
    () => ({
      totalUsers: users.length,
      totalNotes: notes.length,
      totalCategories: Object.keys(categories || {}).length,
      activeNotes: notes.filter((note) => Number(note.progresso) < 100).length,
    }),
    [users.length, notes, categories],
  );

  return (
    <main className="relative z-10 flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="surface-card rounded-[28px] p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Painel operacional</p>
              <h1 className="mt-2 text-3xl font-black text-white">{profile?.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                A base antiga foi carregada com sucesso. Estamos no modo estável, com login e dados restaurados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setProfile(null)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-200"
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Usuários" value={metrics.totalUsers} tone="cyan" />
          <StatCard label="Trabalhos" value={metrics.totalNotes} tone="blue" />
          <StatCard label="Categorias" value={metrics.totalCategories} tone="emerald" />
          <StatCard label="Pedidos restantes" value={remainingOrders} tone="amber" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="surface-card rounded-[28px] p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-300" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-300">Resumo operacional</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatCard label="Ativos" value={metrics.activeNotes} />
              <StatCard label="Concluídos" value={metrics.totalNotes - metrics.activeNotes} />
            </div>
          </div>

          <div className="surface-card rounded-[28px] p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-cyan-300" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-300">Acesso rápido</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Admin: {isAdmin ? 'Sim' : 'Não'}</p>
              <p>Usuários cadastrados: {users.length}</p>
              <p>Última mensagem: sistema em modo estável.</p>
            </div>
            <button
              type="button"
              onClick={() => notify('Painel estável ativo.')}
              className="mt-4 w-full rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-cyan-100"
            >
              Validar interface
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const controller = useComsocController();
  const hasProfile = Boolean(controller.profile);

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <div className="site-vignette" aria-hidden="true" />

      {!hasProfile ? <LoginPanel controller={controller} /> : <Dashboard controller={controller} />}
    </div>
  );
}
