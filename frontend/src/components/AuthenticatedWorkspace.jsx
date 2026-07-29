import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Brain,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  Download,
  Edit2,
  Filter,
  Info,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Table as TableIcon,
  Trash2,
  Tv,
  UserCheck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getCategoryIcon, STATUS_MAP } from '../config/constants';
import { getCountdownInfo, getDueLabel } from '../utils/noteWorkflow';
import { AdminAccountsPanel } from './AdminAccountsPanel';

function formatCardDateTime(value) {
  if (!value) return 'Sem registro';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function AuthenticatedWorkspace({ controller }) {
  const {
    profile,
    users,
    isAdmin,
    activeVisibleNotes,
    userActivityStats,
    categories,
    setShowCategoryModal,
    setShowModal,
    sortConfig,
    setSortConfig,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    setIsSlideModeActive,
    setCurrentSlideIndex,
    setIsSlideTimerPaused,
    setSlideshowCategory,
    timeZulu,
    timeLocal,
    editingNoteId,
    setEditingNoteId,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    editCategory,
    setEditCategory,
    editPrevisao,
    setEditPrevisao,
    setEditProgresso,
    aiBriefingSummary,
    setAiBriefingSummary,
    isGeneratingBriefing,
    isPlayingAudio,
    selectedMonth,
    setSelectedMonth,
    notify,
    getCategoryObj,
    handleGenerateMissionsBriefing,
    handlePlayVoiceBriefing,
    processedNotes,
    spreadsheetNotes,
    spreadsheetSummary,
    remainingOrders,
    analyticsData,
    monthlyReportData,
    canManageUserAdmin,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserAdmin,
    handleColorChange,
    handleProgressUpdate,
    handleSaveTextEdit,
    handleDeleteNote,
    exportSpreadsheet,
    exportMonthlyReport,
  } = controller;

  const [now, setNow] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('mural');
  const [muralOrganization, setMuralOrganization] = useState('person');
  const [attendanceOrganization, setAttendanceOrganization] = useState('all');
  const [auditReportScope, setAuditReportScope] = useState('monthly');
  const [auditReportYear, setAuditReportYear] = useState(() => String(new Date().getFullYear()));
  const [auditChartMetric, setAuditChartMetric] = useState('category');
  const [auditChartView, setAuditChartView] = useState('bars');
  const [auditReportFields, setAuditReportFields] = useState({
    mission: true,
    category: true,
    responsible: true,
    createdAt: true,
    completedAt: true,
  });

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const priorityQueue = activeVisibleNotes
    .map((note) => {
      const progress = Number.isFinite(Number(note.progresso)) ? Number(note.progresso) : 0;
      const countdown = getCountdownInfo(note, now);
      const statusWeight = countdown.tone === 'late' ? 0 : note.color === 'red' ? 1 : countdown.tone === 'warning' ? 2 : 3;

      return {
        ...note,
        progress,
        countdown,
        statusWeight,
      };
    })
    .filter((note) => note.progress < 100)
    .sort((a, b) => a.statusWeight - b.statusWeight || (a.previsao || '').localeCompare(b.previsao || ''));
  const operationSummary = {
    total: activeVisibleNotes.length,
    critical: activeVisibleNotes.filter((note) => note.color === 'red' && (Number(note.progresso) || 0) < 100).length,
    late: activeVisibleNotes.filter((note) => {
      const progress = Number(note.progresso) || 0;
      return progress < 100 && getCountdownInfo(note, now).tone === 'late';
    }).length,
    inProgress: activeVisibleNotes.filter((note) => {
      const progress = Number(note.progresso) || 0;
      return progress > 0 && progress < 100;
    }).length,
  };
  const spreadsheetUserMax = Math.max(1, ...spreadsheetSummary.users.map((item) => item.total));
  const spreadsheetTotal = Math.max(1, spreadsheetSummary.total);
  const workspaceTabs = [
    { id: 'mural', label: 'Mural', icon: Shield, count: processedNotes.length },
    { id: 'atendimento', label: 'Atendimento', icon: ClipboardList, count: priorityQueue.length },
    { id: 'pedidos', label: 'Pedidos', icon: Check, count: remainingOrders },
    { id: 'equipe', label: 'Equipe', icon: BarChart3, count: userActivityStats.length },
    { id: 'planilha', label: 'Planilha', icon: TableIcon, count: spreadsheetSummary.total },
    { id: 'auditoria', label: 'Auditoria', icon: Calendar, count: monthlyReportData.length },
  ];
  const groupNotesByResponsible = useCallback((notesToGroup) => {
    const groups = new Map();

    notesToGroup.forEach((note) => {
      const responsibleName = note.assignedToName || note.creatorName || 'Sem responsável';
      const key = note.assignedToUserId || note.creatorEmail || responsibleName;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          responsibleName,
          notes: [],
        });
      }

      groups.get(key).notes.push(note);
    });

    return [...groups.values()].sort((a, b) => a.responsibleName.localeCompare(b.responsibleName));
  }, []);
  const muralMissionGroups = useMemo(() => {
    if (muralOrganization === 'all') {
      return [{ key: 'all', responsibleName: 'Todos', notes: processedNotes }];
    }

    return groupNotesByResponsible(processedNotes);
  }, [groupNotesByResponsible, muralOrganization, processedNotes]);
  const attendanceMissionGroups = useMemo(() => {
    if (attendanceOrganization === 'all') {
      return [{ key: 'all', responsibleName: 'Todos', notes: priorityQueue }];
    }

    return groupNotesByResponsible(priorityQueue);
  }, [attendanceOrganization, groupNotesByResponsible, priorityQueue]);
  const auditReportPeriodLabel =
    auditReportScope === 'monthly'
      ? new Date(`${selectedMonth}-01T00:00:00`).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })
      : auditReportYear;
  const auditReportRows = useMemo(() => {
    return spreadsheetNotes
      .filter((note) => {
        if (!note.createdAt) return false;
        const createdAt = new Date(note.createdAt);
        if (Number.isNaN(createdAt.getTime())) return false;
        const year = String(createdAt.getFullYear());
        const month = `${year}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

        return auditReportScope === 'monthly' ? month === selectedMonth : year === auditReportYear;
      })
      .map((note) => {
        const progress = Number(note.progresso) || 0;
        const isCompleted = progress >= 100;
        const countdown = getCountdownInfo(note, now);
        const statusKey = isCompleted ? 'completed' : countdown.tone === 'late' ? 'late' : 'inProgress';

        return {
          id: note.id,
          mission: note.title || 'Sem título',
          category: getCategoryObj(note.category).label,
          responsible: note.assignedToName || note.creatorName || 'Sem responsável',
          createdAt: note.createdAt ? new Date(note.createdAt) : null,
          completedAt: isCompleted ? new Date(note.updatedAt || note.createdAt) : null,
          statusKey,
        };
      })
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }, [auditReportScope, auditReportYear, getCategoryObj, now, selectedMonth, spreadsheetNotes]);
  const auditReportSummary = useMemo(() => {
    const total = auditReportRows.length;
    const completed = auditReportRows.filter((row) => row.statusKey === 'completed').length;
    const late = auditReportRows.filter((row) => row.statusKey === 'late').length;
    return {
      total,
      completed,
      late,
      inProgress: total - completed - late,
    };
  }, [auditReportRows]);
  const auditChartData = useMemo(() => {
    const increment = (map, key) => map.set(key, (map.get(key) || 0) + 1);
    const data = new Map();

    auditReportRows.forEach((row) => {
      if (auditChartMetric === 'category') increment(data, row.category);
      if (auditChartMetric === 'responsible') increment(data, row.responsible);
      if (auditChartMetric === 'status') {
        const statusLabel = {
          completed: 'Concluídas',
          late: 'Em atraso',
          inProgress: 'Em andamento',
        }[row.statusKey];
        increment(data, statusLabel);
      }
      if (auditChartMetric === 'timeline') {
        const label =
          auditReportScope === 'monthly'
            ? String(row.createdAt?.getDate() || '').padStart(2, '0')
            : String((row.createdAt?.getMonth() || 0) + 1).padStart(2, '0');
        increment(data, label);
      }
    });

    return [...data.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => (auditChartMetric === 'timeline' ? a.label.localeCompare(b.label) : b.count - a.count));
  }, [auditChartMetric, auditReportRows, auditReportScope]);
  const auditChartMax = Math.max(1, ...auditChartData.map((item) => item.count));
  const auditFieldOptions = [
    { key: 'mission', label: 'Missão' },
    { key: 'category', label: 'Categoria' },
    { key: 'responsible', label: 'Militar' },
    { key: 'createdAt', label: 'Criação' },
    { key: 'completedAt', label: 'Conclusão' },
  ];
  const formatAuditDate = (value) => (value ? value.toLocaleDateString('pt-BR') : 'Pendente');
  const toggleAuditField = (key) => {
    setAuditReportFields((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };
  const exportAuditReport = () => {
    if (auditReportRows.length === 0) {
      notify('Sem dados para gerar o relatório no período selecionado.', 'error');
      return;
    }

    const lines = [
      'RELATÓRIO DE AUDITORIA - COM SOC B ADM QGEX',
      `Período: ${auditReportPeriodLabel}`,
      `Tipo: ${auditReportScope === 'monthly' ? 'Mensal' : 'Anual'}`,
      `Total de missões: ${auditReportSummary.total}`,
      '',
    ];

    auditReportRows.forEach((row, index) => {
      const parts = [];
      if (auditReportFields.mission) parts.push(`Missão: ${row.mission}`);
      if (auditReportFields.category) parts.push(`Categoria: ${row.category}`);
      if (auditReportFields.responsible) parts.push(`Militar responsável: ${row.responsible}`);
      if (auditReportFields.createdAt) parts.push(`Criação: ${formatAuditDate(row.createdAt)}`);
      if (auditReportFields.completedAt) parts.push(`Conclusão: ${formatAuditDate(row.completedAt)}`);
      lines.push(`${index + 1}. ${parts.join(' | ')}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Relatorio_Auditoria_${auditReportScope}_${auditReportScope === 'monthly' ? selectedMonth : auditReportYear}.txt`;
    anchor.click();
    window.URL.revokeObjectURL(url);
    notify('Relatório de auditoria gerado.');
  };

  return (
    <>
        <div className="flex-1 flex flex-col lg:flex-row overflow-x-hidden">
          
          {/* ÁREA PRINCIPAL DO COI */}
          <div className="flex-1 p-3 sm:p-4 lg:p-8 overflow-y-auto space-y-6 sm:space-y-8 lg:space-y-12 min-w-0">
            
            {/* HUD PRINCIPAL */}
            <section className="surface-card relative overflow-hidden rounded-[28px] p-4 sm:rounded-[32px] sm:p-6">
              <div className="absolute right-6 top-6 w-24 h-24 rounded-full border border-blue-500/10 pointer-events-none flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-blue-500/5" />
                <div className="absolute w-full h-0.5 bg-blue-500/10 origin-center rotate-45 animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <Shield size={18} className="animate-pulse" />
                    <span className="text-xs font-black tracking-widest uppercase font-mono">• Centro de Operações de Mídias</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-tight">
                    {isAdmin ? 'Painel Geral de Campanhas Gráficas e Multimídia' : 'Minhas Tarefas Designadas'}
                  </h2>
                  
                </div>

                <div className="flex flex-wrap gap-3 sm:gap-4 font-mono bg-slate-950/70 p-3 sm:p-4 rounded-3xl border border-white/10 w-full md:w-auto">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">H-Local</span>
                    <span className="text-xs font-black text-blue-400">{timeLocal}</span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">H-Zulu</span>
                    <span className="text-xs font-black text-amber-400">{timeZulu}</span>
                  </div>
                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Conexão</span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> ATIVA
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões Táticos Superiores */}
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 relative z-10">
                {isAdmin && (
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <button
                      onClick={() => {
                        if (processedNotes.length === 0) {
                          notify('É necessário ter metas ativas para iniciar a exposição.', 'error');
                          return;
                        }
                        setSlideshowCategory(categoryFilter);
                        setCurrentSlideIndex(0);
                        setIsSlideModeActive(true);
                        setIsSlideTimerPaused(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] px-3 sm:px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-500/30 shadow-lg flex-1 sm:flex-none"
                      title="Exposição multimídia estilo telão para briefing presencial"
                    >
                      <Tv size={13} />
                      <span>Modo Exposição</span>
                    </button>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setShowCategoryModal(true)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 sm:px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-slate-750"
                  >
                    <Plus size={14} className="text-amber-500" /> Nova Categoria
                  </button>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-550 text-white font-bold text-xs px-4 sm:px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <Plus size={14} /> Registrar Trabalho
                  </button>
                  <button
                    onClick={handleGenerateMissionsBriefing}
                    disabled={isGeneratingBriefing}
                    className="bg-purple-600 hover:bg-purple-550 disabled:opacity-50 text-white font-bold text-xs px-4 sm:px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    {isGeneratingBriefing ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Brain size={14} /> Briefing de Situação
                      </>
                    )}
                  </button>
                </div>
                )}
              </div>
            </section>

            <nav className="sticky top-[5.25rem] z-30 rounded-[26px] border border-white/10 bg-slate-950/80 p-2 backdrop-blur-xl shadow-2xl shadow-slate-950/30">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {workspaceTabs.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      aria-pressed={isActive}
                      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-colors cursor-pointer ${
                        isActive
                          ? 'border-cyan-400/50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-950/30'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/40 hover:text-white'
                      }`}
                    >
                      <Icon size={13} className={isActive ? 'text-white' : 'text-blue-400'} />
                      {item.label}
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-mono ${
                        isActive ? 'bg-white/15 text-white' : 'bg-slate-950 text-slate-500'
                      }`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <section id="atendimento" className={`${activeTab === 'atendimento' ? '' : 'hidden'} scroll-mt-32 surface-card rounded-[28px] p-4 sm:p-6 shadow-2xl space-y-5`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <ClipboardList size={16} className="text-emerald-400" /> Atendimento Operacional
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Fila enxuta para decidir o que atender primeiro e reduzir troca de contexto.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'person', label: 'Por pessoa' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAttendanceOrganization(item.id)}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          attendanceOrganization === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                  >
                    <Plus size={14} /> Novo Atendimento
                  </button>
                </div>
              </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.22em]">Na fila</p>
                  <p className="text-2xl font-black text-white mt-1">{operationSummary.total}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-950/35 p-4">
                  <p className="text-[9px] text-red-200/70 uppercase font-black tracking-[0.22em]">Críticos</p>
                  <p className="text-2xl font-black text-red-300 mt-1">{operationSummary.critical}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-950/35 p-4">
                  <p className="text-[9px] text-amber-200/70 uppercase font-black tracking-[0.22em]">Em atraso</p>
                  <p className="text-2xl font-black text-amber-300 mt-1">{operationSummary.late}</p>
                </div>
                <div className="rounded-2xl border border-blue-500/20 bg-blue-950/35 p-4">
                  <p className="text-[9px] text-blue-200/70 uppercase font-black tracking-[0.22em]">Em execução</p>
                  <p className="text-2xl font-black text-blue-300 mt-1">{operationSummary.inProgress}</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4 border-b border-slate-800">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-400" /> Proximos Atendimentos
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">{priorityQueue.length} pendentes</span>
                </div>

                {priorityQueue.length === 0 ? (
                  <div className="p-6 text-center">
                    <UserCheck className="mx-auto text-emerald-400 mb-2" size={28} />
                    <p className="text-xs font-bold text-slate-300">Nenhum atendimento pendente na fila atual.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {attendanceMissionGroups.map((group) => (
                      <div key={group.key} className="divide-y divide-slate-800">
                        {attendanceOrganization === 'person' && (
                          <div className="flex items-center justify-between gap-3 bg-slate-900/60 px-4 py-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 truncate">
                              {group.responsibleName}
                            </p>
                            <span className="text-[9px] font-mono text-slate-500 uppercase">
                              {group.notes.length} {group.notes.length === 1 ? 'card' : 'cards'}
                            </span>
                          </div>
                        )}
                        {group.notes.map((note) => {
                          const catObj = getCategoryObj(note.category);
                          const statusConfig = STATUS_MAP[note.color] || STATUS_MAP.yellow;
                          return (
                            <div key={note.id} className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-3 p-4 hover:bg-slate-900/60 transition-colors">
                              <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${note.countdown.tone === 'late' ? 'bg-red-950/80 text-red-300 border border-red-500/30' : statusConfig.badge}`}>
                                    {note.countdown.label}
                                  </span>
                                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${catObj.bg}`}>
                                    {catObj.label}
                                  </span>
                                </div>
                                <p className="text-sm font-black text-white truncate">{note.title}</p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  Responsavel: {note.assignedToName || note.creatorName || 'Sem responsavel'}
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:min-w-[24rem]">
                                <div className="flex-1 min-w-32">
                                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                                    <div className="h-full bg-emerald-500" style={{ width: `${note.progress}%` }} />
                                  </div>
                                  <p className="mt-1 text-[9px] text-slate-500 font-mono text-right">{note.progress}%</p>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-2">
                                  <span className="text-[8px] font-bold text-slate-500 uppercase">Prioridade</span>
                                  <div className="flex gap-1.5">
                                    {Object.keys(STATUS_MAP).map((color) => (
                                      <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleColorChange(note.id, color)}
                                        className={`w-4 h-4 rounded-full border border-black/10 cursor-pointer ${STATUS_MAP[color].bg} ${note.color === color ? 'ring-2 ring-slate-100' : ''}`}
                                        title={STATUS_MAP[color].label}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSearchQuery(note.title);
                                    setActiveTab('mural');
                                    window.location.hash = 'quadro-operacional';
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg cursor-pointer transition-all"
                                >
                                  Abrir
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* SEÇÃO DO BRIEFING GERADO COM DADOS DO SISTEMA */}
            {activeTab === 'equipe' && isAdmin && (
              <AdminAccountsPanel
                profile={profile}
                users={users}
                notify={notify}
                canManageUserAdmin={canManageUserAdmin}
                handleCreateUser={handleCreateUser}
                handleUpdateUser={handleUpdateUser}
                handleDeleteUser={handleDeleteUser}
                handleToggleUserAdmin={handleToggleUserAdmin}
              />
            )}


            <section className={`${activeTab === 'equipe' ? '' : 'hidden'} surface-card rounded-[28px] p-4 sm:p-6 shadow-2xl space-y-5`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <BarChart3 size={16} className="text-blue-400" /> Controle de Atividades por Usuário
                  </h3>
                  
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  {isAdmin ? 'Visao geral' : 'Minha produtividade'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[19.25rem] overflow-y-auto pr-1">
                {userActivityStats.map((stat) => (
                  <div key={stat.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{stat.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">{stat.total} atividades registradas</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                        {stat.inProgress} ativas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/35 p-3">
                        <Check size={14} className="mx-auto text-emerald-300 mb-1" />
                        <p className="text-lg font-black text-emerald-300">{stat.completed}</p>
                        <p className="text-[8px] text-emerald-200/70 uppercase font-black">Concluídas</p>
                      </div>
                      <div className="rounded-xl border border-red-500/20 bg-red-950/35 p-3">
                        <ShieldAlert size={14} className="mx-auto text-red-300 mb-1" />
                        <p className="text-lg font-black text-red-300">{stat.late}</p>
                        <p className="text-[8px] text-red-200/70 uppercase font-black">Em atraso</p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-blue-950/35 p-3">
                        <Clock size={14} className="mx-auto text-blue-300 mb-1" />
                        <p className="text-lg font-black text-blue-300">{stat.inProgress}</p>
                        <p className="text-[8px] text-blue-200/70 uppercase font-black">Andamento</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {activeTab === 'mural' && aiBriefingSummary && (
              <div className="bg-slate-900 border border-blue-500/20 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-300 relative">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-black tracking-widest font-mono">
                    <Info size={16} /> DIRETRIZ SINTÉTICA DO ESTADO-MAIOR • COMUNICAÇÃO SOCIAL
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePlayVoiceBriefing}
                      className="bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2 font-bold cursor-pointer"
                      title={isPlayingAudio ? "Pausar boletim falado" : "Ouvir boletim por leitura local"}
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX size={12} className="text-red-400 animate-pulse" />
                          <span>Pausar Áudio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} className="text-emerald-400" />
                          <span>Ouvir Boletim</span>
                        </>
                      )}
                    </button>
                    <button onClick={() => setAiBriefingSummary('')} className="text-slate-500 hover:text-white p-1">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-slate-300 text-xs leading-relaxed whitespace-pre-line font-mono bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  {aiBriefingSummary}
                </div>
              </div>
            )}

            {/* FILTRAGEM E BUSCA */}
            <div className={`${activeTab === 'mural' ? '' : 'hidden'} bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="flex flex-wrap items-center gap-3">
                <Filter size={16} className="text-slate-400 shrink-0" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sub-Áreas de Atuação:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === 'all' ? 'bg-blue-600 text-white font-black' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
                  >
                    Visualização Geral
                  </button>
                  {Object.entries(categories).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setCategoryFilter(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === key ? 'bg-blue-600 text-white font-black' : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'}`}
                    >
                      {cat.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-64 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar tarefas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex shrink-0">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'person', label: 'Por pessoa' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMuralOrganization(item.id)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      muralOrganization === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* QUADRO GERAL TÁTICO */}
            <section id="quadro-operacional" className={`${activeTab === 'mural' ? '' : 'hidden'} scroll-mt-32 space-y-4`}>
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" /> Missões Ativas no Mural ({processedNotes.length})
                </h3>
              </div>

              {processedNotes.length === 0 ? (
                <div className="text-center py-14 sm:py-20 bg-slate-900/10 border border-slate-800 rounded-2xl sm:rounded-3xl">
                  <Shield className="mx-auto text-slate-600 mb-4 animate-pulse" size={40} />
                  <h3 className="text-sm font-bold text-slate-300">Nenhum registro de mídia atende aos critérios atuais</h3>
                  <p className="text-xs text-slate-500 mt-1">Insira novos trabalhos manuais ou utilize o painel inteligente abaixo.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  {muralMissionGroups.map((group) => (
                    <section key={group.key} className="rounded-2xl border border-slate-800 bg-slate-950/35 p-3 sm:p-4 space-y-4">
                      {muralOrganization === 'person' && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-300 uppercase font-mono shrink-0">
                            {group.responsibleName.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Responsável</p>
                            <h4 className="text-sm font-black text-white truncate">{group.responsibleName}</h4>
                          </div>
                        </div>
                        <span className="w-fit rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                          {group.notes.length} {group.notes.length === 1 ? 'missão' : 'missões'}
                        </span>
                      </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {group.notes.map((note) => {
                    const style = STATUS_MAP[note.color] || STATUS_MAP.yellow;
                    const catObj = getCategoryObj(note.category);
                    const rawProgress = note.progresso !== undefined ? Number(note.progresso) : 50;
                    const progress = Number.isFinite(rawProgress) ? rawProgress : 50;
                    const dueLabel = getDueLabel(note);
                    const previsao = dueLabel;
                    const countdown = getCountdownInfo(note, now);
                    const CatIcon = getCategoryIcon(catObj.iconName);
                    const isEditing = editingNoteId === note.id;
                    const isExpiredUnfinished = countdown.tone === 'late' && progress < 100;
                    const countdownToneClass = {
                      active: 'text-blue-300 bg-blue-500/10 border-blue-500/20',
                      warning: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
                      late: 'text-red-300 bg-red-500/10 border-red-500/20',
                      completed: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
                      neutral: 'text-slate-300 bg-slate-900 border-slate-800',
                    }[countdown.tone];

                    return (
                      <div
                        key={note.id}
                        className={`bg-[#0d1220] border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200 group relative ${
                          isExpiredUnfinished
                            ? 'border-red-500/80 ring-2 ring-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.85)] animate-pulse'
                            : `border-slate-800 hover:border-slate-700 ${style.glow}`
                        }`}
                      >
                        <div className={`h-1.5 w-full ${style.bg}`} />

                        <div className="p-5 space-y-4 flex-1">
                          <div className="flex justify-between items-start">
                            <span className={`p-1 px-2 rounded-lg ${catObj.bg} text-[10px] flex items-center gap-1 font-mono font-bold`}>
                              <CatIcon size={12} /> {catObj.label}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${style.badge}`}>
                              {style.label}
                            </span>
                          </div>

                          {isEditing ? (
                            <div className="space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                              <input 
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                className="w-full bg-slate-900 text-white p-2 rounded text-xs font-bold outline-none border border-slate-800"
                              />
                              <textarea 
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={3}
                                className="w-full bg-slate-900 text-white p-2 rounded text-xs outline-none border border-slate-800"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <select 
                                  value={editCategory}
                                  onChange={e => setEditCategory(e.target.value)}
                                  className="bg-slate-900 text-white p-2 rounded border border-slate-800"
                                >
                                  {Object.entries(categories).map(([key, cat]) => (
                                    <option key={key} value={key}>{cat.label}</option>
                                  ))}
                                </select>
                                <input 
                                  value={editPrevisao}
                                  onChange={e => setEditPrevisao(e.target.value)}
                                  placeholder="Prazo / término"
                                  className="bg-slate-900 text-white p-2 rounded border border-slate-800 sm:col-span-2"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleSaveTextEdit(note.id)} className="bg-emerald-700 hover:bg-emerald-850 text-white text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer">Salvar</button>
                                <button onClick={() => setEditingNoteId(null)} className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] px-3 py-1.5 rounded font-bold cursor-pointer">Voltar</button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-1">
                                {note.title}
                              </h3>
                              <p className="text-xs text-slate-400 leading-relaxed mt-2 h-20 overflow-y-auto pr-1">
                                {note.content}
                              </p>
                            </div>
                          )}

                          {/* Medidor de progresso */}
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className="text-slate-500 uppercase font-bold">Progresso Operacional</span>
                              <span className="text-blue-400 font-black">{progress}%</span>
                            </div>
                            
                            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  note.color === 'red' ? 'bg-red-500' : note.color === 'blue' ? 'bg-blue-500' : 'bg-amber-400'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>

                            <div className="space-y-2">
                              <span className="text-[8px] text-slate-500 uppercase font-bold">Atualizar Progresso</span>
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleProgressUpdate(note.id, Math.max(0, progress - 10))}
                                  className="min-h-8 rounded-lg bg-slate-950 border border-slate-800 hover:border-red-400/60 text-[10px] font-mono font-black text-slate-200 hover:text-red-200 cursor-pointer transition-all"
                                  title="Diminuir 10% do progresso"
                                >
                                  -10%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleProgressUpdate(note.id, Math.min(99, progress + 10))}
                                  className="min-h-8 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-400/60 text-[10px] font-mono font-black text-slate-200 hover:text-blue-200 cursor-pointer transition-all"
                                  title="Aumentar 10% do progresso"
                                >
                                  +10%
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleProgressUpdate(note.id, 100)}
                                  className="min-h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/80 text-[10px] font-mono font-black cursor-pointer transition-all"
                                  title="Marcar como concluído"
                                >
                                  Concluído
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RODAPÉ DO TRABALHO */}
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-500 uppercase font-bold">Conclusão estimada:</span>
                            <span className="text-amber-400 font-black uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-500/10 font-mono">
                              {previsao}
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-[10px] font-mono">
                            <span className="text-slate-500 uppercase font-bold">Contador:</span>
                            <span className={`font-black uppercase px-2 py-1 rounded border text-right ${countdownToneClass}`}>
                              {countdown.label}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] pt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-[8px] font-black text-blue-400 uppercase">
                                {(note.assignedToName || note.creatorName) ? (note.assignedToName || note.creatorName).substring(0, 2).toUpperCase() : "OP"}
                              </div>
                              <span className="text-slate-300 font-bold max-w-[100px] truncate">{note.assignedToName || note.creatorName}</span>
                            </div>

                            <div className="flex gap-2">
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(note.id);
                                      setEditTitle(note.title || '');
                                      setEditContent(note.content || '');
                                      setEditCategory(note.category || 'design');
                                      setEditPrevisao(note.previsao || 'Sem prazo');
                                      setEditProgresso(note.progresso || 50);
                                    }}
                                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                                    title="Editar"
                                  >
                                    <Edit2 size={11} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteNote(note)}
                                    className="p-1 rounded bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 cursor-pointer"
                                    title="Deletar"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-1 rounded-lg border border-slate-800 bg-slate-900/40 p-2 text-[9px] font-mono">
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 text-slate-500 uppercase font-bold">
                                <Clock size={10} /> Criado em
                              </span>
                              <span className="text-slate-300 font-bold text-right">
                                {formatCardDateTime(note.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 text-slate-500 uppercase font-bold">
                                <RefreshCw size={10} /> Atualizado em
                              </span>
                              <span className="text-slate-300 font-bold text-right">
                                {formatCardDateTime(note.updatedAt || note.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded text-[10px] mt-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Mudar Criticidade</span>
                            <div className="flex gap-1.5">
                              {Object.keys(STATUS_MAP).map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleColorChange(note.id, color)}
                                  className={`w-3.5 h-3.5 rounded-full border border-black/10 cursor-pointer ${STATUS_MAP[color].bg} ${note.color === color ? 'ring-2 ring-slate-100' : ''}`}
                                  title={STATUS_MAP[color].label}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </section>

            {/* PLANILHA CONSOLIDADA */}
            <section id="planilha" className={`${activeTab === 'planilha' ? '' : 'hidden'} scroll-mt-32 bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl`}>
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TableIcon className="text-blue-500" size={18} /> Planilha Consolidada de Atividades
                  </h3>
                </div>
                <button 
                  onClick={exportSpreadsheet} 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-550 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg text-white cursor-pointer"
                >
                  <Download size={14} /> Exportar Planilha (Excel)
                </button>
              </div>

              <div className="p-6 border-b border-slate-800 bg-slate-950/25 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Total na planilha</p>
                    <p className="text-2xl font-black text-white mt-1">{spreadsheetSummary.total}</p>
                  </div>
                  <div className="bg-emerald-950/35 border border-emerald-500/20 rounded-2xl p-4">
                    <p className="text-[9px] text-emerald-200/70 uppercase font-black tracking-wider">Concluídas</p>
                    <p className="text-2xl font-black text-emerald-300 mt-1">{spreadsheetSummary.completed}</p>
                  </div>
                  <div className="bg-red-950/35 border border-red-500/20 rounded-2xl p-4">
                    <p className="text-[9px] text-red-200/70 uppercase font-black tracking-wider">Em atraso</p>
                    <p className="text-2xl font-black text-red-300 mt-1">{spreadsheetSummary.late}</p>
                  </div>
                  <div className="bg-blue-950/35 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-[9px] text-blue-200/70 uppercase font-black tracking-wider">Em andamento</p>
                    <p className="text-2xl font-black text-blue-300 mt-1">{spreadsheetSummary.inProgress}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <PieChart size={14} className="text-blue-400" /> Resumo Geral
                    </h4>
                    <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${(spreadsheetSummary.completed / spreadsheetTotal) * 100}%` }}
                        title="Concluídas"
                      />
                      <div
                        className="bg-red-500"
                        style={{ width: `${(spreadsheetSummary.late / spreadsheetTotal) * 100}%` }}
                        title="Em atraso"
                      />
                      <div
                        className="bg-blue-500"
                        style={{ width: `${(spreadsheetSummary.inProgress / spreadsheetTotal) * 100}%` }}
                        title="Em andamento"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9px] uppercase font-black text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Concluídas</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Atraso</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Andamento</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <BarChart3 size={14} className="text-blue-400" /> Distribuição por Usuário
                    </h4>
                    {spreadsheetSummary.users.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Sem atividades para resumir.</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {spreadsheetSummary.users.map((item) => (
                          <div key={item.id} className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-300 font-bold truncate">{item.name}</span>
                              <span className="text-slate-500 font-mono">{item.total}</span>
                            </div>
                            <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
                              <div className="bg-emerald-500" style={{ width: `${(item.completed / spreadsheetUserMax) * 100}%` }} />
                              <div className="bg-red-500" style={{ width: `${(item.late / spreadsheetUserMax) * 100}%` }} />
                              <div className="bg-blue-500" style={{ width: `${(item.inProgress / spreadsheetUserMax) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="overflow-auto max-h-[190px]">
                <table className="w-full min-w-[760px] text-left border-collapse">
                  <thead className="bg-slate-950 text-slate-400 text-[9px] uppercase tracking-widest font-bold sticky top-0 z-10">
                    <tr>
                      {['title', 'category', 'assignedToName', 'color', 'createdAt'].map(key => (
                        <th 
                          key={key} 
                          className="p-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                        >
                          <div className="flex items-center gap-1.5">
                            {key === 'title' ? 'Identificação' : key === 'category' ? 'Sub-Área' : key === 'assignedToName' ? 'Responsável' : key === 'color' ? 'Estado' : 'Data de Criação'}
                            <ArrowUpDown size={10} className="text-slate-500" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {spreadsheetNotes.map(n => {
                      const statusConfig = STATUS_MAP[n.color] || STATUS_MAP.yellow;
                      const catObj = getCategoryObj(n.category);
                      const isCompleted = (n.progresso || 0) >= 100;
                      return (
                        <tr key={n.id} className="hover:bg-slate-800/20 transition-colors text-xs">
                          <td className="p-4 font-bold text-white max-w-[200px] truncate">{n.title}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold text-slate-300">
                              {catObj.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300">{n.assignedToName || n.creatorName}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded text-[8px] font-extrabold uppercase ${isCompleted ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : statusConfig.badge}`}>
                              {isCompleted ? 'Concluído' : statusConfig.label}
                            </span>
                          </td>
                          <td className="p-4 text-slate-500">
                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString('pt-BR') : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ANALYTICS */}
            <section id="auditoria" className={`${activeTab === 'auditoria' ? '' : 'hidden'} scroll-mt-32 space-y-8`}>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="text-amber-400" size={18} />
                      Relatório de Auditoria
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Modelo simplificado com missão, categoria, militar responsável, criação e conclusão.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex">
                      {[
                        { id: 'monthly', label: 'Mensal' },
                        { id: 'annual', label: 'Anual' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAuditReportScope(item.id)}
                          className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            auditReportScope === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {auditReportScope === 'monthly' ? (
                      <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={auditReportYear}
                        onChange={(event) => setAuditReportYear(event.target.value)}
                        className="w-28 bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    )}

                    <button
                      type="button"
                      onClick={exportAuditReport}
                      className="bg-blue-600 hover:bg-blue-550 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download size={14} /> Gerar TXT
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/20 space-y-5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                      <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Missões</p>
                      <p className="text-2xl font-black text-white mt-1">{auditReportSummary.total}</p>
                    </div>
                    <div className="bg-emerald-950/35 border border-emerald-500/20 rounded-2xl p-4">
                      <p className="text-[9px] text-emerald-200/70 uppercase font-black tracking-wider">Concluídas</p>
                      <p className="text-2xl font-black text-emerald-300 mt-1">{auditReportSummary.completed}</p>
                    </div>
                    <div className="bg-blue-950/35 border border-blue-500/20 rounded-2xl p-4">
                      <p className="text-[9px] text-blue-200/70 uppercase font-black tracking-wider">Em andamento</p>
                      <p className="text-2xl font-black text-blue-300 mt-1">{auditReportSummary.inProgress}</p>
                    </div>
                    <div className="bg-red-950/35 border border-red-500/20 rounded-2xl p-4">
                      <p className="text-[9px] text-red-200/70 uppercase font-black tracking-wider">Em atraso</p>
                      <p className="text-2xl font-black text-red-300 mt-1">{auditReportSummary.late}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-5">
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Customização do relatório</h4>
                        <p className="mt-1 text-[10px] text-slate-500">Escolha as colunas que devem aparecer na prévia e no TXT.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {auditFieldOptions.map((field) => (
                          <label
                            key={field.key}
                            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={auditReportFields[field.key]}
                              onChange={() => toggleAuditField(field.key)}
                              className="accent-blue-600"
                            />
                            {field.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                          Prévia do relatório - {auditReportPeriodLabel}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{auditReportRows.length} registros</span>
                      </div>
                      <div className="overflow-auto max-h-72">
                        <table className="w-full min-w-[760px] text-left border-collapse">
                          <thead className="bg-slate-900 text-slate-500 text-[9px] uppercase tracking-widest font-black sticky top-0">
                            <tr>
                              {auditReportFields.mission && <th className="p-3">Missão</th>}
                              {auditReportFields.category && <th className="p-3">Categoria</th>}
                              {auditReportFields.responsible && <th className="p-3">Militar responsável</th>}
                              {auditReportFields.createdAt && <th className="p-3">Criação</th>}
                              {auditReportFields.completedAt && <th className="p-3">Conclusão</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 text-xs">
                            {auditReportRows.length === 0 ? (
                              <tr>
                                <td className="p-5 text-center text-slate-500 font-mono" colSpan={5}>
                                  Nenhuma missão encontrada para o período.
                                </td>
                              </tr>
                            ) : (
                              auditReportRows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-900/70 transition-colors">
                                  {auditReportFields.mission && <td className="p-3 font-bold text-white max-w-[240px] truncate">{row.mission}</td>}
                                  {auditReportFields.category && <td className="p-3 text-slate-300">{row.category}</td>}
                                  {auditReportFields.responsible && <td className="p-3 text-slate-300">{row.responsible}</td>}
                                  {auditReportFields.createdAt && <td className="p-3 text-slate-500 font-mono">{formatAuditDate(row.createdAt)}</td>}
                                  {auditReportFields.completedAt && <td className="p-3 text-slate-500 font-mono">{formatAuditDate(row.completedAt)}</td>}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                        <BarChart3 size={14} className="text-blue-400" />
                        Gráficos customizáveis
                      </h4>
                      <p className="mt-1 text-[10px] text-slate-500">Altere a métrica e o formato de exibição do gráfico.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <select
                        value={auditChartMetric}
                        onChange={(event) => setAuditChartMetric(event.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="category">Por categoria</option>
                        <option value="responsible">Por militar</option>
                        <option value="status">Por status</option>
                        <option value="timeline">{auditReportScope === 'monthly' ? 'Por dia' : 'Por mês'}</option>
                      </select>
                      <select
                        value={auditChartView}
                        onChange={(event) => setAuditChartView(event.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="bars">Barras</option>
                        <option value="cards">Cartões</option>
                        <option value="compact">Compacto</option>
                      </select>
                    </div>
                  </div>

                  {auditChartData.length === 0 ? (
                    <div className="text-center py-10 bg-slate-950/40 border border-slate-800 rounded-2xl">
                      <PieChart className="mx-auto text-slate-600 mb-2" size={32} />
                      <p className="text-xs text-slate-400 font-mono">Sem dados para montar gráficos no período.</p>
                    </div>
                  ) : auditChartView === 'cards' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                      {auditChartData.map((item) => (
                        <div key={item.label} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider truncate">{item.label}</p>
                          <p className="text-3xl font-black text-white mt-2">{item.count}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={auditChartView === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-3'}>
                      {auditChartData.map((item) => (
                        <div key={item.label} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-3 text-xs mb-2">
                            <span className="font-bold text-slate-300 truncate">{item.label}</span>
                            <span className="font-mono text-slate-500">{item.count}</span>
                          </div>
                          <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${(item.count / auditChartMax) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Status Geral */}
                <div className="bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                    <PieChart className="text-blue-500" size={16} /> Distribuição de Status Operacional
                  </h3>
                  <div className="flex items-end justify-around h-48 gap-4 px-4 pt-4">
                    {analyticsData.status.map(s => {
                      const height = activeVisibleNotes.length > 0 ? (s.count / activeVisibleNotes.length) * 100 : 0;
                      return (
                        <div key={s.label} className="flex-1 flex flex-col items-center gap-3">
                          <div className="w-full relative flex flex-col justify-end h-32">
                            <div 
                              className="w-full rounded-t-xl transition-all duration-1000 shadow-lg relative" 
                              style={{ height: `${Math.max(height, 5)}%`, backgroundColor: s.colorCode }}
                            >
                              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-white">
                                {s.count}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase text-center leading-tight truncate w-full" title={s.label}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RELATÓRIO MENSAL POR CATEGORIAS */}
              <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="text-amber-400" size={18} />
                      Auditoria de Produção Mensal por Categorias
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold font-mono">Competência:</span>
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        className="bg-slate-950 border border-slate-800 text-xs text-white p-2.5 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <button
                      onClick={exportMonthlyReport}
                      className="bg-blue-600 hover:bg-blue-550 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Download size={14} /> Baixar Relatório (TXT)
                    </button>
                  </div>
                </div>

                {monthlyReportData.length === 0 ? (
                  <div className="text-center py-10 bg-slate-950/40 border border-slate-800 rounded-2xl">
                    <Clock className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="text-xs text-slate-400 font-mono">Nenhum registro de produção verificado no período de {selectedMonth}.</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                    {monthlyReportData.map((userReport) => (
                      <div key={userReport.name} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600/25 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase font-mono">
                              {userReport.name ? userReport.name.substring(0, 2).toUpperCase() : "OP"}
                            </div>
                            <span className="text-xs font-black text-white">{userReport.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {userReport.actionsCount} interações registradas no mês
                          </span>
                        </div>

                        {/* Grade dinâmica de categorias no relatório de auditoria */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {Object.entries(categories).map(([catKey, cat]) => {
                            const CatIconComp = getCategoryIcon(cat.iconName);
                            const count = userReport.categoriesCount[catKey] || 0;
                            return (
                              <div key={catKey} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                                  <span className="font-bold text-slate-300 uppercase text-[9px] flex items-center gap-1 truncate max-w-[150px]">
                                    <CatIconComp size={12} /> {cat.label}
                                  </span>
                                  <span className="bg-blue-900/40 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                    {count}
                                  </span>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                  {userReport.redMissions.filter(m => m.category === catKey).map(m => (
                                    <p key={m.id} className="text-[10px] text-red-400 truncate font-semibold">• [Crítica] {m.title}</p>
                                  ))}
                                  {userReport.blueMissions.filter(m => m.category === catKey).map(m => (
                                    <p key={m.id} className="text-[10px] text-blue-400 truncate">• [Pronto/Exec] {m.title}</p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

        </div>
    </>
  );
}
