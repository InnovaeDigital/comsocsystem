import { ArrowRight, Compass, ShieldAlert, Sparkles, User } from 'lucide-react';

const pillars = [
  {
    title: 'Comunicação Visual',
    text: 'Painéis, identidades e entregas com leitura clara e presença institucional.',
  },
  {
    title: 'Design Gráfico',
    text: 'Fluxos ágeis para artes, ajustes e acompanhamento de produção.',
  },
  {
    title: 'Drones',
    text: 'Campo para captação aérea, planejamento e controle operacional.',
  },
  {
    title: 'Audiovisual',
    text: 'Organização de foto, vídeo, edição e finalização em um só espaço.',
  },
];

export function AuthScreen({ controller }) {
  const { setProfile, notify } = controller;

  return (
    <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/75 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden p-8 sm:p-10 lg:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.15),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.95))]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">
                <ShieldAlert size={13} /> Central operacional
              </span>

              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-300">
                  <Compass size={12} />
                  Comunicação, criação e inteligência visual
                </p>
                <h1 className="max-w-2xl text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Sistema de
                  <span className="block bg-gradient-to-r from-cyan-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
                    comando visual
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Um painel profissional para organizar demandas de Comunicação Visual, Design Gráfico, Drones e
                  Audiovisual com rapidez, clareza e presença institucional.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                    <Sparkles size={16} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">{pillar.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-8 lg:p-12">
          <div className="w-full rounded-[28px] border border-white/10 bg-slate-950/85 p-6 shadow-2xl shadow-slate-950/40">
            <div className="mb-8">
              <div className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-400 via-blue-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-900/30">
                <div className="flex h-full w-full items-center justify-center rounded-[23px] bg-slate-950">
                  <span className="text-sm font-black tracking-[0.35em] text-white">CS</span>
                </div>
              </div>
              <h2 className="text-center text-2xl font-black uppercase tracking-tight text-white">Entrar no painel</h2>
              <p className="mt-2 text-center text-xs font-medium text-slate-400">
                Use o nome funcional para carregar a base migrada.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const name = event.target.userName.value.trim();
                if (!name) return;
                try {
                  await setProfile({ name });
                  notify(`Conexão estabelecida para ${name}.`);
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
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/[0.08]"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-900/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Entrar
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
