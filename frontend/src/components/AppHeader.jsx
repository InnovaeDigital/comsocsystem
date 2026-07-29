import { LogOut, Radar } from 'lucide-react';

export function AppHeader({ controller }) {
  const { profile, setProfile, isAdmin } = controller;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 px-3 py-3 backdrop-blur-2xl shadow-2xl shadow-slate-950/30 sm:px-5 lg:px-8">
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="shrink-0 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-900/25 h-12 w-12 sm:h-14 sm:w-14">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-slate-950">
              <span className="text-[11px] font-black tracking-[0.28em] text-white">CS</span>
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-fit whitespace-nowrap rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.26em] text-cyan-200">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950 text-[11px] font-black text-cyan-200">
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
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
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
