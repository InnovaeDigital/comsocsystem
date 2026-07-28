import { Sparkles } from 'lucide-react';

export function Toast({ controller }) {
  const { toast } = controller;

  return toast ? (
    <div className="fixed bottom-6 left-1/2 z-[300] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-3 text-xs font-bold text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl animate-fade-in flex items-center gap-2">
      <Sparkles size={14} className="text-cyan-300" />
      {toast.msg}
    </div>
  ) : null;
}
