import { useState } from 'react';
import { ArrowRight, LayoutDashboard, LogOut, Radar, Shield } from 'lucide-react';
import { AuthenticatedWorkspace } from './components/AuthenticatedWorkspace';
import { useComsocController } from './hooks/useComsocController';

function AppHeader({ controller }) {
  const { profile, setProfile, isAdmin } = controller;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 px-3 py-3 backdrop-blur-2xl shadow-2xl shadow-slate-950/30 sm:px-5 lg:px-8">
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="shrink-0 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-red-500 p-[1px] shadow-lg shadow-blue-900/25 h-12 w-12 sm:h-14 sm:w-14">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-slate-950">
              <span className="text-[11px] font-black tracking-[0.28em] text-white">CS</span>
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-fit whitespace-nowrap rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.26em] text-blue-200">
                Com Soc B Adm QGEx
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.24em] text-slate-300">
                <Radar size={10} />
                Operação ativa
              </span>
            </div>
            <p className="max-w-3xl text-[10px] font-black uppercase leading-snug tracking-[0.22em] text-slate-400 sm:text-[11px]">
              Gestão visual de comunicação, produção, audiovisual e drones em um único painel.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
          {profile && (
            <div className="flex w-full shrink-0 items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-xl lg:w-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-[11px] font-black text-blue-200">
                {(profile.name || 'CS')
                  .split(' ')
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0 text-left lg:text-right">
                <p className="max-w-36 truncate text-[11px] font-extrabold text-white">{profile.name}</p>
                <div className="flex items-center gap-2 lg:justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="font-mono text-[8px] font-black uppercase tracking-[0.24em] text-slate-400">
                    {isAdmin ? 'Admin' : 'Operador'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfile(null)}
                className="cursor-pointer rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-300"
                title="Desconectar do terminal"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 text-center text-[13px] font-bold uppercase tracking-widest text-slate-500">
      <span>© 2026 Com Soc.</span>
      <span className="mx-2 text-slate-700">|</span>
      <span>Desenvolvido por CB TOMÉ e EUSTÁQUIO.</span>
    </footer>
  );
}

function Toast({ controller }) {
  const { toast } = controller;
  if (!toast) return null;
  const toneMap = {
    success: 'border-blue-400/30 bg-blue-400/10 text-blue-100',
    error: 'border-red-400/30 bg-red-400/10 text-red-100',
    info: 'border-slate-400/30 bg-slate-400/10 text-slate-100',
  };
  return (
    <div className="fixed right-4 top-4 z-[100]">
      <div className={`rounded-2xl border px-4 py-3 shadow-2xl ${toneMap[toast.type] || toneMap.info}`}>
        <p className="text-sm font-semibold">{toast.msg}</p>
      </div>
    </div>
  );
}

function SimpleModalShell({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-slate-950/60">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-white">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen({ controller }) {
  const [name, setName] = useState('');

  const featurePills = [
    { label: 'Operação' },
    { label: 'Administração' },
    { label: 'Produção' },
    { label: 'Monitoramento' },
  ];

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/10 bg-slate-950/78 shadow-2xl shadow-slate-950/60 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(239,68,68,0.14),_transparent_22%),linear-gradient(180deg,_rgba(2,6,23,0.94),_rgba(15,23,42,0.88))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">
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
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-200">
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
                  placeholder="Digite seu nome funcional"
                  autoFocus
                  className="w-full rounded-[18px] border border-white/10 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.09]"
                />
              </label>

              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-blue-700 via-blue-600 to-red-600 px-4 py-3.5 text-sm font-black uppercase tracking-[0.28em] text-white shadow-lg shadow-blue-950/30 transition-transform hover:-translate-y-0.5"
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
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-200">
                  <LayoutDashboard size={16} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-200">{item.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  Acesso direto ao sistema funcional.
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function WorkspaceScreen({ controller }) {
  const { showModal, setShowModal, showCategoryModal, setShowCategoryModal } = controller;

  return (
    <>
      <AppHeader controller={controller} />
      <main className="relative z-10 flex-1 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <AuthenticatedWorkspace controller={controller} />
        </div>
        <AppFooter />
      </main>
      <Toast controller={controller} />
      <SimpleModalShell open={showModal} title="Novo trabalho" onClose={() => setShowModal(false)}>
        <p className="text-sm text-slate-300">
          O formulário de criação continua dentro do workspace funcional. Use o painel principal para concluir a ação.
        </p>
      </SimpleModalShell>
      <SimpleModalShell open={showCategoryModal} title="Nova categoria" onClose={() => setShowCategoryModal(false)}>
        <p className="text-sm text-slate-300">
          As categorias continuam disponíveis no painel operacional do sistema.
        </p>
      </SimpleModalShell>
    </>
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
      {hasProfile ? <WorkspaceScreen controller={controller} /> : <LoginScreen controller={controller} />}
    </div>
  );
}
