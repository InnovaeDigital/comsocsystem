import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Erro inesperado na aplicação:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b13] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <h1 className="text-lg font-black uppercase tracking-wider text-white">
              Falha ao carregar o painel
            </h1>
            <p className="text-sm text-slate-400">
              Recarregue a página. Se persistir, verifique se o backend e o JSONBin estão ativos.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
