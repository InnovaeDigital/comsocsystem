import { ShieldAlert, User } from 'lucide-react';

export function AuthScreen({ controller }) {
  const { setProfile, notify } = controller;

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 glass-panel shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%)]" />
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[640px] relative">
          <section className="p-8 sm:p-10 lg:p-14 flex flex-col justify-between gap-10">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                <ShieldAlert size={13} /> Canal oficial
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-none">
                  Comunicação Social
                </h1>
                <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                  Interface enxuta, rápida e pronta para operação diária com foco em produtividade, visibilidade e baixo peso.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                ['Leve', 'Menos ruído visual e menos carga desnecessária.'],
                ['Ágil', 'Acesso rápido aos fluxos mais usados.'],
                ['Profissional', 'Visual premium com animações sutis.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">{title}</p>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-12 flex items-center">
            <div className="w-full rounded-[24px] border border-white/10 bg-slate-950/60 p-6 sm:p-8 backdrop-blur-xl">
              <div className="mb-6">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 p-[1px]">
                  <div className="h-full w-full rounded-2xl bg-slate-950 flex items-center justify-center">
                    <span className="text-white font-black tracking-[0.3em]">CS</span>
                  </div>
                </div>
                <h2 className="text-xl font-black text-white uppercase">Entrar no painel</h2>
                <p className="mt-2 text-xs text-slate-400">Use seu nome funcional para carregar o ambiente.</p>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const name = event.target.userName.value.trim();
                  if (!name) return;
                  try {
                    await setProfile({ name });
                    notify(`Conexão estabelecida para: ${name}!`);
                  } catch (error) {
                    notify(error.message || 'Não foi possível acessar o sistema.', 'error');
                  }
                }}
              >
                <label className="block">
                  <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Nome funcional
                  </span>
                  <div className="relative">
                    <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      name="userName"
                      required
                      placeholder="Ex: Cb Tomé"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-cyan-400/50 focus:bg-white/8"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  className="group w-full rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-900/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Entrar
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
