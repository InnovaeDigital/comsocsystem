import { Suspense, lazy } from 'react';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { AuthenticatedWorkspace } from './components/AuthenticatedWorkspace';
import { AuthScreen } from './components/AuthScreen';
import { Toast } from './components/Toast';
import { CreateCategoryModal } from './components/modals/CreateCategoryModal';
import { CreateWorkModal } from './components/modals/CreateWorkModal';
import { useComsocController } from './hooks/useComsocController';

const SlideshowMode = lazy(() => import('./components/SlideshowMode').then((module) => ({ default: module.SlideshowMode })));

export default function App() {
  const controller = useComsocController();

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <div className="site-aurora" aria-hidden="true" />
      <div className="site-grid" aria-hidden="true" />
      <Suspense fallback={null}>
        <SlideshowMode controller={controller} />
      </Suspense>
      {controller.profile ? (
        <>
          <AppHeader controller={controller} />
          <AuthenticatedWorkspace controller={controller} />
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
