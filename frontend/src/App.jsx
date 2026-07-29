import { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');

  return (
    <main className="min-h-screen relative z-10 flex items-center justify-center px-4 py-8">
      <section className="surface-card w-full max-w-2xl rounded-[28px] p-6 sm:p-8">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200">Sistema em recuperação</p>
        <h1 className="mt-3 text-3xl font-black text-white">Base visual operacional carregada.</h1>
        <p className="mt-3 max-w-xl text-sm text-slate-300">
          Esta versão mínima existe para confirmar que o frontend está montando corretamente no navegador.
          Se esta tela aparecer, o problema está em um módulo maior da aplicação e não no Vite ou no deploy.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Nome funcional
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Cb Tomé"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
            />
          </label>
          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            {name ? `Pronto para autenticar: ${name}` : 'Digite um nome para testar a interface.'}
          </div>
        </div>
      </section>
    </main>
  );
}
