import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Shield,
  Settings,
  X,
} from 'lucide-react';
import { getCategoryIcon, STATUS_MAP } from '../config/constants';
import { getCountdownInfo, getDueLabel } from '../utils/noteWorkflow';

export function SlideshowMode({ controller }) {
  const {
    categories,
    isSlideModeActive,
    setCurrentSlideIndex,
    isSlideTimerPaused,
    setIsSlideTimerPaused,
    slideTimerProgress,
    slideshowCategory,
    setSlideshowCategory,
    itemsPerSlide,
    setItemsPerSlide,
    timeLocal,
    getCategoryObj,
    slideshowNotes,
    totalSlides,
    activeSlideIndex,
    currentSlideMissions,
    handleNextSlide,
    handlePrevSlide,
    slideExposureTime,
    setSlideExposureTime,
    showSlideExposureModal,
    setShowSlideExposureModal,
  } = controller;

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* MODO EXPOSIÇÃO COI - FULLSCREEN TELÃO MULTIMÍDIA */}
      {/* ------------------------------------------------------------- */}
      {isSlideModeActive && (
        <div className="fixed inset-0 bg-[#03060a] z-[300] flex flex-col justify-between p-6 md:p-10 text-white animate-fade-in font-mono overflow-hidden">
          
          {/* Fundo Cibernético com Varredura de Radar SVG */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center overflow-hidden">
            <svg className="w-[800px] h-[800px] text-blue-500 animate-[spin_20s_linear_infinite]" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="0.2" />
              <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.2" />
              <path d="M100,100 L100,5 A95,95 0 0,1 195,100 Z" fill="url(#radarSweep)" stroke="none" />
              <defs>
                <linearGradient id="radarSweep" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Cabeçalho do COI com Configurações em Tempo Real */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-slate-800 pb-5 gap-4 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="bg-red-700 px-3.5 py-1 text-xs font-black rounded text-white animate-pulse tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" /> • ATUALIZAÇÃO EM TEMPO REAL
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-black tracking-widest text-slate-300 uppercase">
                  • INNOVAE SYSTEMS •
                </h1>
              </div>

              {/* PAINEL DE CONFIGURAÇÕES DO SLIDESHOW */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-2xl mt-2 md:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Preferências:</span>
                  <select 
                    value={slideshowCategory} 
                    onChange={(e) => {
                      setSlideshowCategory(e.target.value);
                      setCurrentSlideIndex(0);
                    }}
                    className="bg-[#05080f] border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="all">Todas as Mídias</option>
                    {Object.entries(categories).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Densidade:</span>
                  <select 
                    value={itemsPerSlide} 
                    onChange={(e) => {
                      setItemsPerSlide(Number(e.target.value));
                      setCurrentSlideIndex(0);
                    }}
                    className="bg-[#05080f] border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={1}>1 Missão / Slide</option>
                    <option value={2}>2 Missões / Slide</option>
                    <option value={3}>3 Missões / Slide</option>
                    <option value={5}>5 Missões / Slide</option>
                    <option value={10}>10 Missões / Slide</option>
                    <option value={20}>20 Missões / Slide</option>
                    <option value={30}>30 Missões / Slide</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Relógios Operacionais do COI */}
            <div className="flex items-center gap-6 text-xs md:text-sm">
              <div className="hidden md:block">
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Teste de Rede</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block font-bold uppercase">Hora Local (H-Local)</span>
                <span className="text-blue-400 font-bold">{timeLocal}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
              </div>
            </div>
          </div>

          {/* Visualização de Slides de Grande Impacto (Suporte Dinâmico de Densidade) */}
          <div className="flex-1 my-8 relative z-10 overflow-y-auto pr-1">
            {slideshowNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Shield className="text-slate-600 animate-pulse" size={48} />
                <p className="text-slate-400 text-sm">Nenhuma missão localizada nesta categoria de exposição.</p>
              </div>
            ) : itemsPerSlide === 1 ? (
              currentSlideMissions[0] && (() => {
                const catObj = getCategoryObj(currentSlideMissions[0].category);
                const assigneeName = currentSlideMissions[0].assignedToName || currentSlideMissions[0].creatorName || 'Sem responsável';
                const countdown = getCountdownInfo(currentSlideMissions[0]);
                const dueLabel = getDueLabel(currentSlideMissions[0]);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full animate-fade-in">
                    
                    {/* Esquerda: Informações Gerais da Atividade - COL SPAN 3 */}
                    <div className="lg:col-span-3 space-y-6 text-left flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${catObj.bg}`}>
                          {catObj.label}
                        </span>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${STATUS_MAP[currentSlideMissions[0].color]?.badge}`}>
                          {STATUS_MAP[currentSlideMissions[0].color]?.label}
                        </span>
                      </div>

                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase border-l-8 border-blue-500 pl-4">
                        {currentSlideMissions[0].title}
                      </h2>

                      {/* PORCENTAGEM ABAIXO DO TEXTO */}
                      <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800 px-6 py-4 rounded-2xl w-fit">
                        <div className="text-center">
                          <span className="text-4xl font-black text-blue-400">
                            {currentSlideMissions[0].progresso || 0}%
                          </span>
                          <span className="text-xs text-slate-400 block uppercase font-bold tracking-widest mt-1">Progresso</span>
                        </div>
                        <div className="w-40 bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                          <div 
                            className={`h-full rounded-full ${
                              currentSlideMissions[0].color === 'red' ? 'bg-red-500' : currentSlideMissions[0].color === 'blue' ? 'bg-blue-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${currentSlideMissions[0].progresso || 0}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-slate-300 text-base md:text-xl leading-relaxed max-w-4xl font-sans font-normal py-4">
                        {currentSlideMissions[0].content}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 font-mono text-xs">
                        <div>
                          <span className="text-slate-500 block uppercase font-bold mb-2">Responsável</span>
                          <span className="text-white text-sm font-black">{assigneeName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase font-bold mb-2">Prazo</span>
                          <span className="text-amber-400 text-sm font-black uppercase">{dueLabel}</span>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <span className="text-slate-500 block uppercase font-bold mb-2">Contador</span>
                          <span className={`text-sm font-black uppercase ${countdown.tone === 'late' ? 'text-red-400' : 'text-slate-200'}`}>
                            {countdown.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direita: Lista de Cards Abertos */}
                    <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 p-6 rounded-[25px] overflow-y-auto h-full backdrop-blur-md">
                      <div className="sticky top-0 bg-slate-900/60 pb-4 mb-4 border-b border-slate-800">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          Cards Abertos
                        </h3>
                        <span className="text-[10px] text-slate-500 block mt-1">Total: {slideshowNotes.length}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {slideshowNotes.map((note, idx) => {
                          const isActive = note.id === currentSlideMissions[0]?.id;
                          const catCfg = getCategoryObj(note.category);
                          const statusCfg = STATUS_MAP[note.color] || STATUS_MAP.yellow;
                          return (
                            <div
                              key={note.id}
                              className={`p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-blue-950/60 border-blue-500/80 ring-1 ring-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                                  : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/60'
                              }`}
                              onClick={() => setCurrentSlideIndex(Math.floor(idx / itemsPerSlide))}
                            >
                              <div className="flex gap-1.5 items-start mb-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold flex-shrink-0 ${catCfg.bg}`}>
                                  {catCfg.label.split(' ')[0]}
                                </span>
                                <span className={`text-[7px] font-bold px-1 py-0.5 rounded flex-shrink-0 ${statusCfg.badge}`}>
                                  {statusCfg.label.split(' ')[0]}
                                </span>
                              </div>
                              <div className="font-black text-white uppercase line-clamp-2 leading-tight mb-1">
                                {note.title}
                              </div>
                              <div className="flex justify-between items-center text-[9px]">
                                <span className="text-slate-400">{note.progresso || 0}%</span>
                                <span className={isActive ? 'text-blue-300' : 'text-slate-500'}>{note.assignedToName || 'N/A'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
                        <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg flex-1 text-center">
                          <div className="text-amber-400 font-black text-sm">{activeSlideIndex + 1}</div>
                          <div className="text-[8px] text-slate-500 uppercase">de {totalSlides}</div>
                        </div>
                        {countdown.tone === 'late' && (
                          <div className="bg-red-950/70 border border-red-500/40 px-3 py-2 rounded-lg flex-1 flex items-center justify-center">
                            <span className="text-red-300 text-[8px] font-black">EM ATRASO</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col h-full justify-center">
                <div className="mb-6 flex justify-between items-center px-2">
                  <span className="text-xs text-slate-500 uppercase font-mono tracking-wider">
                    Exibindo lote de {currentSlideMissions.length} missões ativas nesta lâmina
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-bold">
                    Lâmina {activeSlideIndex + 1} de {totalSlides}
                  </span>
                </div>

                <div className={`grid gap-4 items-stretch ${
                  itemsPerSlide === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  itemsPerSlide === 3 ? 'grid-cols-1 md:grid-cols-3' :
                  itemsPerSlide === 5 ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5' :
                  itemsPerSlide === 10 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' :
                  'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
                }`}>
                  {currentSlideMissions.map((mission) => {
                    const statusCfg = STATUS_MAP[mission.color] || STATUS_MAP.yellow;
                    const catCfg = getCategoryObj(mission.category);
                    const CatIcon = getCategoryIcon(catCfg.iconName);
                    const isDense10 = itemsPerSlide === 10;
                    const assigneeName = mission.assignedToName || mission.creatorName || 'Sem responsável';
                    const countdown = getCountdownInfo(mission);
                    const isLate = countdown.tone === 'late';

                    return (
                      <div 
                        key={mission.id} 
                        className={`bg-[#0d1220]/80 border flex flex-col justify-between transition-all duration-300 relative overflow-hidden backdrop-blur-md ${isLate ? 'border-red-500/70 ring-1 ring-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.45)]' : `border-slate-800 ${statusCfg.glow}`} ${isDense10 ? 'p-3 rounded-2xl' : 'p-6 rounded-3xl'}`}
                      >
                        <div className={isDense10 ? 'space-y-2' : 'space-y-4'}>
                          <div className="flex justify-between items-start gap-1">
                            <span className={`px-2 py-0.5 rounded-lg ${catCfg.bg} text-[9px] font-mono font-bold flex items-center gap-1`}>
                              <CatIcon size={10} /> {catCfg.label.split(' ')[0]}
                            </span>
                            <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${statusCfg.badge}`}>
                              {statusCfg.label.split(' ')[0]}
                            </span>
                          </div>

                          <h3 className={`font-black text-white uppercase tracking-tight border-l-2 border-blue-500 pl-2 line-clamp-2 ${isDense10 ? 'text-xs min-h-[32px]' : 'text-sm min-h-[40px]'}`}>
                            {mission.title}
                          </h3>

                          {!isDense10 && (
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 select-none">
                              {mission.content}
                            </p>
                          )}
                        </div>

                        <div className={`border-t border-slate-800 ${isDense10 ? 'space-y-1.5 pt-2 mt-2' : 'space-y-3 pt-4 mt-4'}`}>
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500 uppercase font-bold">Progresso</span>
                            <span className="text-blue-400 font-black">{mission.progresso || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
                            <div 
                              className={`h-full rounded-full ${
                                mission.color === 'red' ? 'bg-red-500' : mission.color === 'blue' ? 'bg-blue-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${mission.progresso || 0}%` }}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-1">
                            <span className="text-slate-400 font-bold truncate max-w-[80px]">{assigneeName}</span>
                            <span className={`font-mono font-black uppercase ${isLate ? 'text-red-300' : 'text-amber-400'}`}>
                              {isLate ? 'Em atraso' : countdown.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Controle Inferior & Linha de Tempo do Slideshow */}
          <div className="border-t border-slate-800 pt-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 uppercase font-bold flex items-center gap-2">
                  <Clock size={12} /> Auto-Rotação do Painel
                </span>
                <span className="text-slate-400 font-bold">{isSlideTimerPaused ? 'PAUSADO' : 'SENSILMENTE ATIVO'}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${isSlideTimerPaused ? 0 : slideTimerProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrevSlide}
                className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setIsSlideTimerPaused(prev => !prev)}
                className="p-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl cursor-pointer font-bold flex items-center gap-2 px-6"
              >
                {isSlideTimerPaused ? <Play size={16} fill="white" /> : <Pause size={16} fill="white" />}
                <span>{isSlideTimerPaused ? "RETOMAR" : "PAUSAR"}</span>
              </button>
              <button 
                onClick={handleNextSlide}
                className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => setShowSlideExposureModal(true)}
                className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-xl cursor-pointer flex items-center gap-2 px-4"
                title="Configurar tempo de exposição"
              >
                <Settings size={18} />
                <span className="text-xs font-bold">{slideExposureTime}s</span>
              </button>
            </div>

            <div className="hidden md:block text-right text-[10px] text-slate-500 uppercase">
              Controles: <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-mono">←</kbd> <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-mono">→</kbd> para navegar • <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-mono">Espaço</kbd> para pausar • <kbd className="bg-slate-900 px-1 py-0.5 rounded border border-slate-800 font-mono">Esc</kbd> para sair
            </div>

          </div>

          {/* MODAL DE CONFIGURAÇÃO DE TEMPO DE EXPOSIÇÃO */}
          {showSlideExposureModal && (
            <div className="fixed inset-0 bg-black/50 z-[400] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500/20 border border-blue-500/40 p-2.5 rounded-lg">
                      <Clock className="text-blue-400" size={20} />
                    </div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest">
                      Tempo de Exibição
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowSlideExposureModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Exibição do tempo atual */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
                    <span className="text-5xl font-black text-blue-400">{slideExposureTime}</span>
                    <span className="text-xl text-slate-400 ml-2">segundos</span>
                  </div>

                  {/* Controles deslizantes e botões pré-definidos */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                        Tempo Personalizado
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={slideExposureTime}
                        onChange={(e) => setSlideExposureTime(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                        <span>2s</span>
                        <span>30s</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                        Presets
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[3, 5, 8, 10, 15, 20, 25, 30].map((secs) => (
                          <button
                            key={secs}
                            onClick={() => setSlideExposureTime(secs)}
                            className={`py-2 rounded-lg font-bold text-sm transition-all ${
                              slideExposureTime === secs
                                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {secs}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Info sobre o tempo */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                    <p className="text-xs text-amber-300 font-mono">
                      ⚡ Cada slide será exibido por <span className="font-black">{slideExposureTime} segundos</span> antes de avançar automaticamente.
                    </p>
                  </div>

                  {/* Botão de fechamento */}
                  <button
                    onClick={() => setShowSlideExposureModal(false)}
                    className="w-full bg-blue-600 hover:bg-blue-550 text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider"
                  >
                    Aplicar Configuração
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
