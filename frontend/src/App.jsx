import { AppFooter } from './components/AppFooter';
import { Toast } from './components/Toast';
import { CreateCategoryModal } from './components/modals/CreateCategoryModal';
import { CreateWorkModal } from './components/modals/CreateWorkModal';
import { useComsocController } from './hooks/useComsocController';

export default function App() {
  const controller = useComsocController();
  const hasProfile = Boolean(controller.profile);

  const LoginPanel = (
    <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-12">
      <section className="surface-card w-full max-w-3xl rounded-[28px] p-6 sm:p-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Acesso operacional</p>
          <h1 className="text-3xl font-black text-white">Sistema de comunicação social</h1>
          <p className="max-w-2xl text-sm text-slate-300">
            O login está carregando a base migrada. Se algum componente avançado falhar, este painel simples
            permanece disponível para acesso.
          </p>
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const name = event.currentTarget.userName.value.trim();
            if (!name) return;
            try {
              await controller.setProfile({ name });
            } catch (error) {
              controller.notify(error.message || 'Não foi possível acessar o sistema.', 'error');
            }
          }}
        >
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Nome funcional
            </span>
            <input
              name="userName"
              required
              placeholder="Ex: Cb Tomé"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/[0.08]"
            />
          </label>
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 px-4 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-900/20 transition-transform hover:-translate-y-0.5"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <div className="site-vignette" aria-hidden="true" />
      <div className="fixed left-4 top-4 z-[60] rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-300 shadow-2xl backdrop-blur-xl">
        {hasProfile ? 'Painel carregado' : 'Carregando interface'}
      </div>
      {!hasProfile ? (
        LoginPanel
      ) : (
        <main className="relative z-10 flex-1">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-2xl shadow-2xl shadow-slate-950/30 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Com Soc B Adm QGEx</p>
                <h1 className="text-xl font-black text-white">Painel operacional</h1>
              </div>
              <button
                type="button"
                onClick={() => controller.setProfile(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-200"
              >
                Sair
              </button>
            </div>
          </header>
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="surface-card rounded-[28px] p-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Painel carregado</p>
                <h1 className="text-3xl font-black text-white">Interface pronta para operação.</h1>
                <p className="max-w-2xl text-sm text-slate-300">
                  O login está funcionando e a base migrada foi restaurada. Agora estamos reintroduzindo o workspace
                  em camadas, para evitar tela vazia.
                </p>
              </div>
            </section>
          </div>
        </main>
      )}
      <CreateWorkModal controller={controller} />
      <CreateCategoryModal controller={controller} />
      {hasProfile && <AppFooter />}
      <Toast controller={controller} />
    </div>
  );
}
