import { } from 'react';
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

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <div className="site-vignette" aria-hidden="true" />
      {controller.profile ? (
        <>
          <AppHeader controller={controller} />
          <main className="relative z-10 flex-1">
            <AuthenticatedWorkspace controller={controller} />
          </main>
        </>
      ) : (
        <AuthScreen controller={controller} />
      )}
      <CreateWorkModal controller={controller} />
      <CreateCategoryModal controller={controller} />
      {controller.profile && <AppFooter />}
      <Toast controller={controller} />
    </div>
  );
}
