import { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronRight,
  CircleDashed,
  ClipboardList,
  Droplets,
  LayoutDashboard,
  LogOut,
  Palette,
  PlayCircle,
  Shield,
  Sparkles,
  Telescope,
  Video,
  Users,
} from 'lucide-react';
import { useComsocController } from './hooks/useComsocController';

function SectionCard({ title, eyebrow, icon: Icon, children, className = '' }) {
  return (
    <section className={`surface-card rounded-[28px] p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">{eyebrow}</p>
          <h2 className="mt-2 text-lg font-black text-white sm:text-xl">{title}</h2>
        </div>
        {Icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, tone = 'cyan', hint }) {
  const toneMap = {
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
    blue: 'border-blue-400/20 bg-blue-400/10 text-blue-100',
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    rose: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  };

  return (
    <article className={`rounded-[22px] border p-4 ${toneMap[tone] || toneMap.cyan}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-300">{hint}</p> : null}
    </article>
  );
}

function LoginScreen({ controller }) {
  const [name, setName] = useState('Cb Tomé');
  const featurePills = [
    { icon: Palette, label: 'Comunicação Visual' },
    { icon: Sparkles, label: 'Design Gráfico' },
    { icon: Telescope, label: 'Drones' },
    { icon: Video, label: 'Audiovisual' },
  ];

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/78 shadow-2xl shadow-slate-950/60 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(34,211,238,0.12),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.9),_rgba(15,23,42,0.82))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-amber-200">
              <Shield size={13} /> Canal oficial de monitoramento da Com Soc B Adm QGEx
            </span>

            <div className="mt-6 space-y-4">
              <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl lg:text-7xl">
                Comunicação Social
              </h1>
              <p className="mx-auto max-w-2xl text-sm font-semibold uppercase tracking-[0.3em] text-slate-300 sm:text-base">
                Monitoramento de missões em tempo real
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/80 p-5 sm:p-6 shadow-xl shadow-slate-950/40">
            <div className="mb-5 flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-200">
                <LayoutDashboard size={18} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black text-white sm:text-xl">Identificação de Acesso</h2>
                <p className="mt-1 text-sm text-slate-400">Insira as credenciais para se conectar de forma integrada.</p>
              </div>
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
                  Nome funcional (posto/graduação)
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Cb Tomé"
                  autoFocus
                  className="w-full rounded-[18px] border border-white/10 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.09]"
                />
              </label>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 px-4 py-3.5 text-sm font-black uppercase tracking-[0.28em] text-white shadow-lg shadow-blue-950/30 transition-transform hover:-translate-y-0.5"
              >
                Entrar
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 px-4 py-3 text-center text-[11px] font-medium text-slate-400">
              © 2026 Innovae Digital - Systems. | Desenvolvido por CB TOMÉ e EUSTÁQUIO.
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {featurePills.map((item) => (
              <article key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                  <item.icon size={16} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">{item.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Entrada com estética premium, pronta para institucional.
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Dashboard({ controller }) {
  const { profile, users, notes, categories, remainingOrders, activities, presenceList, setProfile, notify } =
    controller;

  const stats = useMemo(() => {
    const activeNotes = notes.filter((note) => Number(note.progresso) < 100);
    const criticalNotes = notes.filter((note) => note.color === 'red' && Number(note.progresso) < 100);
    return {
      totalUsers: users.length,
      totalNotes: notes.length,
      totalCategories: Object.keys(categories || {}).length,
      activeNotes: activeNotes.length,
      criticalNotes: criticalNotes.length,
      totalPresence: presenceList.length,
      recentActivities: activities.length,
    };
  }, [users, notes, categories, presenceList, activities]);

  const recentNotes = useMemo(() => [...notes].slice(0, 5), [notes]);
  const activeUsers = useMemo(() => [...users].slice(0, 6), [users]);

  return (
    <main className="relative z-10 flex-1 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="surface-card rounded-[32px] p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { icon: Palette, label: 'Comunicação Visual' },
                { icon: Sparkles, label: 'Design Gráfico' },
                { icon: Telescope, label: 'Drones' },
                { icon: Video, label: 'Audiovisual' },
              ].map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-200"
                >
                  <item.icon size={12} className="text-cyan-200" />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                  <LayoutDashboard size={12} /> Painel operacional
                </div>
                <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">{profile?.name}</h1>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
                  O sistema foi refeito para ganhar uma aparência mais institucional, sofisticada e estável.
                  Agora o fluxo principal abre primeiro, e o restante entra por camadas.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => notify('Painel estável carregado.')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-slate-200"
                >
                  <Shield size={14} />
                  Validar
                </button>
                <button
                  type="button"
                  onClick={() => setProfile(null)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 text-xs font-black uppercase tracking-[0.24em] text-white"
                >
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Usuários" value={stats.totalUsers} tone="cyan" hint="Base restaurada" />
          <Metric label="Trabalhos" value={stats.totalNotes} tone="blue" hint="Fluxo de produção" />
          <Metric label="Categorias" value={stats.totalCategories} tone="emerald" hint="Áreas de trabalho" />
          <Metric label="Pedidos restantes" value={remainingOrders} tone="amber" hint="Contador operacional" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <SectionCard title="Visão geral" eyebrow="Resumo executivo" icon={ClipboardList}>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Metric label="Ativos" value={stats.activeNotes} tone="cyan" />
              <Metric label="Críticos" value={stats.criticalNotes} tone="rose" />
              <Metric label="Presença" value={stats.totalPresence} tone="emerald" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2">
                <Camera size={14} className="text-cyan-200" />
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Linha editorial</p>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                O sistema foi organizado para leitura rápida em tela, com blocos amplos, contraste alto e foco em
                operação institucional.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Navegação rápida" eyebrow="Acesso rápido" icon={CircleDashed}>
            <div className="space-y-3">
              {[
                ['Comunicação Visual', 'Identidades, sinalização e peças institucionais.'],
                ['Design Gráfico', 'Artes, revisão e produção.'],
                ['Drones', 'Captação aérea e planejamento.'],
                ['Audiovisual', 'Foto, vídeo e edição.'],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="text-sm font-black text-white">{title}</p>
                    <p className="mt-1 text-xs text-slate-400">{text}</p>
                  </div>
                  <ChevronRight size={16} className="mt-1 text-cyan-200" />
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard title="Trabalhos recentes" eyebrow="Linha de produção" icon={LayoutDashboard}>
            <div className="space-y-3">
              {recentNotes.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  Nenhum trabalho carregado.
                </div>
              ) : (
                recentNotes.map((note) => (
                  <article key={note.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-white">{note.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {note.assignedToName || note.creatorName || 'Sem responsável'}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">
                        {note.color || 'sem prioridade'}
                      </span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title="Equipe ativa" eyebrow="Pessoas" icon={Users}>
            <div className="space-y-3">
              {activeUsers.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                  Nenhum usuário carregado.
                </div>
              ) : (
                activeUsers.map((member) => (
                  <article
                    key={member.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-black text-white ${member.color || 'bg-slate-700'}`}
                      >
                        {member.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-cyan-200" />
                  </article>
                ))
              )}
            </div>
          </SectionCard>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <SectionCard title="Sinalização operacional" eyebrow="Status" icon={PlayCircle}>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="font-black text-cyan-100">Login funcional</p>
                <p className="mt-1 text-xs text-cyan-100/80">A autenticação e a carga da base migrada estão ativas.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-black text-white">Próximo passo</p>
                <p className="mt-1 text-xs text-slate-400">
                  Reintroduzir o workspace antigo por blocos, com validação em cada etapa.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Resumo técnico" eyebrow="Sistema" icon={Droplets}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Base" value="Migrada" tone="emerald" />
              <Metric label="Deploy" value="Vercel" tone="blue" />
              <Metric label="Estilo" value="Premium" tone="cyan" />
              <Metric label="Arquitetura" value="Estável" tone="amber" />
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Ações recomendadas</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-cyan-200" /> Publicar esta versão no Vercel
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-cyan-200" /> Validar login em aba anônima
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight size={14} className="text-cyan-200" /> Reintroduzir módulos antigos por blocos
                </li>
              </ul>
            </div>
          </SectionCard>
        </section>
      </div>
    </main>
  );
}

export default function App() {
  const controller = useComsocController();
  const hasProfile = Boolean(controller.profile);

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#050814] font-sans text-slate-100 selection:bg-cyan-500 selection:text-white">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <div className="site-vignette" aria-hidden="true" />
      {hasProfile ? <Dashboard controller={controller} /> : <LoginScreen controller={controller} />}
    </div>
  );
}
