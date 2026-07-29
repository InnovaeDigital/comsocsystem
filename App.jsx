import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { AuthenticatedWorkspace } from './components/AuthenticatedWorkspace';
import { AuthScreen } from './components/AuthScreen';
import { Toast } from './components/Toast';
import { CreateCategoryModal } from './components/modals/CreateCategoryModal';
import { CreateWorkModal } from './components/modals/CreateWorkModal';
import { useComsocController } from './hooks/useComsocController';

export default function App() {
  const controller = useComsocController();
  const hasProfile = Boolean(controller.profile);

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <div className="site-vignette" aria-hidden="true" />
      <div className="fixed left-4 top-4 z-[60] rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-300 shadow-2xl backdrop-blur-xl">
        {hasProfile ? 'Painel carregado' : 'Carregando interface'}
      </div>
      {hasProfile ? (
        <>
          <AppHeader controller={controller} />
          <main className="relative z-10 flex-1">
            <AuthenticatedWorkspace controller={controller} />
          </main>
        </>
      ) : (
        <main className="relative z-10 flex-1">
          <AuthScreen controller={controller} />
        </main>
      )}
      <CreateWorkModal controller={controller} />
      <CreateCategoryModal controller={controller} />
      {hasProfile && <AppFooter />}
      <Toast controller={controller} />
    </div>
  );
}
