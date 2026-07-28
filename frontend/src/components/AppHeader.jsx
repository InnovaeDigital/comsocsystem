import { LogOut } from 'lucide-react';

export function AppHeader({ controller }) {
  const { profile, setProfile, isAdmin } = controller;

  return (
    <header className="glass-panel border-b border-white/10 px-3 sm:px-5 lg:px-8 py-3 top-0 z-50 sticky backdrop-blur-xl shadow-2xl shadow-slate-950/30">
      <div className="w-full flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 lg:gap-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-[1px] shadow-lg shadow-blue-900/30">
            <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <span className="text-[11px] font-black tracking-[0.3em] text-white">CS</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-200 whitespace-nowrap">
              Com Soc B Adm QGEx
            </span>
            <p className="text-[7px] sm:text-[8px] text-slate-400 uppercase tracking-wider font-black text-left leading-snug max-w-3xl">
              Painel tático otimizado, com visual enxuto e resposta rápida.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 w-full lg:w-auto lg:ml-auto">
          {profile && (
            <div className="flex items-center justify-between gap-2 bg-white/5 px-2.5 sm:px-3 py-1.5 rounded-2xl border border-white/10 shrink-0 w-full lg:w-auto">
              <div className="text-left lg:text-right min-w-0">
                <p className="text-[11px] font-extrabold text-white truncate max-w-28">{profile.name}</p>
                <div className="flex items-center gap-1.5 lg:justify-end">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                    {isAdmin ? 'Admin' : 'Operador'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfile(null);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
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
