import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AVATAR_COLORS, DEFAULT_CATEGORIES, STATUS_MAP } from '../config/constants';
import { api } from '../services/api';
import { exportActivitySpreadsheet } from '../utils/exportSpreadsheet';
import { getNoteWorkflowStatus } from '../utils/noteWorkflow';

const storedProfileKey = 'innovae_user_profile';
const DEFAULT_CATEGORY_KEYS = new Set(Object.keys(DEFAULT_CATEGORIES));

function readStoredProfile() {
  try {
    const stored = localStorage.getItem(storedProfileKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function mergeCategories(categories) {
  return Object.keys(categories || {}).length > 0 ? categories : DEFAULT_CATEGORIES;
}

function noteMatchesSearch(note, query) {
  return (
    note.title?.toLowerCase().includes(query) ||
    note.content?.toLowerCase().includes(query) ||
    note.creatorName?.toLowerCase().includes(query) ||
    note.assignedToName?.toLowerCase().includes(query)
  );
}

function getSortValue(note, key) {
  return note[key] ?? '';
}

function filterAndSortNotes(notes, { searchQuery, categoryFilter, sortConfig }) {
  let result = [...notes];
  const query = searchQuery.trim().toLowerCase();

  if (query) {
    result = result.filter((note) => noteMatchesSearch(note, query));
  }

  if (categoryFilter !== 'all') {
    result = result.filter((note) => note.category === categoryFilter);
  }

  if (sortConfig.key) {
    result.sort((a, b) => {
      const aVal = getSortValue(a, sortConfig.key);
      const bVal = getSortValue(b, sortConfig.key);
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
}

export function useComsocController() {
  const [profile, setProfileState] = useState(readStoredProfile);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [presenceList, setPresenceList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [remainingOrders, setRemainingOrders] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSlideModeActive, setIsSlideModeActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSlideTimerPaused, setIsSlideTimerPaused] = useState(false);
  const [slideTimerProgress, setSlideTimerProgress] = useState(0);
  const [slideshowCategory, setSlideshowCategory] = useState('all');
  const [itemsPerSlide, setItemsPerSlide] = useState(10);
  const [slideExposureTime, setSlideExposureTime] = useState(8); // em segundos
  const [showSlideExposureModal, setShowSlideExposureModal] = useState(false);
  const [timeZulu, setTimeZulu] = useState('');
  const [timeLocal, setTimeLocal] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('design');
  const [editPrevisao, setEditPrevisao] = useState('');
  const [editProgresso, setEditProgresso] = useState(50);
  const [aiBriefingSummary, setAiBriefingSummary] = useState('');
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const slideIntervalRef = useRef(null);
  const slideProgressIntervalRef = useRef(null);
  const chatEndRef = useRef(null);
  const pendingCreatedNotesRef = useRef(new Map());
  const pendingDeletedNoteIdsRef = useRef(new Set());
  const pendingCreatedCategoriesRef = useRef(new Map());
  const pendingDeletedCategoryKeysRef = useRef(new Set());

  const presetTacticalMessages = [
    'Operação de mídia iniciada.',
    'Apoio audiovisual finalizado no Bloco Central.',
    'Atenção: Novo boletim gráfico pendente.',
    'Missão crítica concluída com sucesso.',
  ];

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const refreshData = useCallback(async () => {
    const data = await api.bootstrap();
    const deletedIds = pendingDeletedNoteIdsRef.current;
    const pendingCreatedNotes = [...pendingCreatedNotesRef.current.values()];
    const nextNotes = (data.notes || []).filter((note) => !deletedIds.has(note.id));
    const nextNoteIds = new Set(nextNotes.map((note) => note.id));

    setNotes([
      ...pendingCreatedNotes.filter((note) => !deletedIds.has(note.id) && !nextNoteIds.has(note.id)),
      ...nextNotes,
    ]);
    setChatMessages(data.chatMessages || []);
    setPresenceList(data.presenceList || []);
    setActivities(data.activities || []);
    setUsers(data.users || []);
    setRemainingOrders(Number(data.remainingOrders || 0));

    const deletedCategoryKeys = pendingDeletedCategoryKeysRef.current;
    const nextCategories = Object.fromEntries(
      Object.entries(data.categories || {}).filter(([key]) => !deletedCategoryKeys.has(key)),
    );

    pendingCreatedCategoriesRef.current.forEach((category, key) => {
      if (!deletedCategoryKeys.has(key)) {
        nextCategories[key] = category;
      }
    });

    setCategories(mergeCategories(nextCategories));
  }, []);

  const setProfile = useCallback(
    async (nextProfile) => {
      if (!nextProfile) {
        localStorage.removeItem(storedProfileKey);
        setProfileState(null);
        setNotes([]);
        setChatMessages([]);
        setPresenceList([]);
        setActivities([]);
        setUsers([]);
        setRemainingOrders(0);
        return;
      }

      const result = await api.login(nextProfile);
      setProfileState(result.profile);
      localStorage.setItem(storedProfileKey, JSON.stringify(result.profile));
      await refreshData();
    },
    [refreshData],
  );

  const getCategoryObj = useCallback(
    (catKey) =>
      categories[catKey] ||
      DEFAULT_CATEGORIES[catKey] || {
        label: catKey,
        iconName: 'Palette',
        bg: 'bg-slate-900 text-slate-300 border border-slate-800',
      },
    [categories],
  );

  useEffect(() => {
    const storedProfile = readStoredProfile();
    if (!storedProfile) return;

    setProfile(storedProfile).catch((error) => {
      console.error('Erro ao restaurar sessao:', error);
      notify('Backend indisponível. Verifique se a API e o JSONBin estão acessíveis.', 'error');
    });
  }, [notify, setProfile]);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeLocal(now.toLocaleTimeString('pt-BR'));
      setTimeZulu(`${now.toISOString().slice(11, 19)} Z`);
    };
    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profile) return undefined;

    let cancelled = false;
    const poll = () => {
      if (cancelled) return;
      refreshData().catch((error) => console.error('Erro ao sincronizar dados:', error));
    };

    poll();
    const interval = setInterval(poll, 10000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [profile, refreshData]);

  useEffect(() => {
    if (!profile) return undefined;

    const updatePresence = () => {
      api.updatePresence(profile).catch((error) => {
        console.error('Erro ao atualizar presenca:', error);
      });
    };

    updatePresence();
    const interval = setInterval(updatePresence, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  const isAdmin = profile?.role === 'admin';

  const visibleNotes = useMemo(() => {
    if (!profile) return [];
    if (isAdmin) return notes;
    return notes.filter((note) => note.assignedToUserId === profile.id);
  }, [notes, profile, isAdmin]);

  const activeVisibleNotes = useMemo(() => {
    const now = timeLocal ? Date.now() : Date.now();
    return visibleNotes.filter((note) => getNoteWorkflowStatus(note, now) !== 'completed');
  }, [visibleNotes, timeLocal]);

  const userActivityStats = useMemo(() => {
    const now = timeLocal ? Date.now() : Date.now();
    const stats = new Map();

    const ensureStats = (member) => {
      const key = member?.id || member?.name;
      if (!key) return null;

      if (!stats.has(key)) {
        stats.set(key, {
          id: member.id || key,
          name: member.name || 'Sem responsável',
          completed: 0,
          late: 0,
          inProgress: 0,
          total: 0,
        });
      }

      return stats.get(key);
    };

    if (isAdmin) {
      users.forEach((member) => ensureStats(member));
    } else if (profile) {
      ensureStats(profile);
    }

    visibleNotes.forEach((note) => {
      const member =
        users.find((candidate) => candidate.id === note.assignedToUserId) || {
          id: note.assignedToUserId || note.creatorEmail || note.creatorName,
          name: note.assignedToName || note.creatorName || 'Sem responsável',
        };
      const stat = ensureStats(member);
      if (!stat) return;

      const workflowStatus = getNoteWorkflowStatus(note, now);
      if (workflowStatus === 'completed') stat.completed += 1;
      else if (workflowStatus === 'late') stat.late += 1;
      else stat.inProgress += 1;

      stat.total += 1;
    });

    return [...stats.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [visibleNotes, users, profile, isAdmin, timeLocal]);

  const canManageUserAdmin = useCallback(
    (targetUser) => {
      if (!isAdmin || !profile || !targetUser) return false;
      if (targetUser.isOwner) return false;
      if (targetUser.id === profile.id) return false;
      if (!profile.isOwner && profile.adminGrantedBy === targetUser.id) return false;
      return true;
    },
    [isAdmin, profile],
  );

  const slideshowNotes = useMemo(() => {
    let result = [...activeVisibleNotes];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q)) ||
          (n.creatorName && n.creatorName.toLowerCase().includes(q)) ||
          (n.assignedToName && n.assignedToName.toLowerCase().includes(q)),
      );
    }
    if (slideshowCategory !== 'all') {
      result = result.filter((n) => n.category === slideshowCategory);
    }
    return result;
  }, [activeVisibleNotes, slideshowCategory, searchQuery]);

  const totalSlides = useMemo(
    () => Math.ceil(slideshowNotes.length / itemsPerSlide) || 1,
    [slideshowNotes, itemsPerSlide],
  );

  const activeSlideIndex = useMemo(
    () => (totalSlides === 0 ? 0 : currentSlideIndex % totalSlides),
    [currentSlideIndex, totalSlides],
  );

  const currentSlideMissions = useMemo(() => {
    const start = activeSlideIndex * itemsPerSlide;
    return slideshowNotes.slice(start, start + itemsPerSlide);
  }, [slideshowNotes, activeSlideIndex, itemsPerSlide]);

  const handleNextSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) =>
      totalSlides === 0 ? 0 : (prevIndex + 1) % totalSlides,
    );
  }, [totalSlides]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlideIndex((prevIndex) =>
      totalSlides === 0 ? 0 : (prevIndex - 1 + totalSlides) % totalSlides,
    );
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isSlideModeActive) return;
      if (event.key === 'ArrowRight') {
        handleNextSlide();
      } else if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsSlideTimerPaused((prev) => !prev);
      } else if (event.key === 'Escape') {
        setIsSlideModeActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSlideModeActive, handleNextSlide, handlePrevSlide]);

  useEffect(() => {
    if (!isSlideModeActive || slideshowNotes.length === 0 || isSlideTimerPaused) {
      clearInterval(slideIntervalRef.current);
      clearInterval(slideProgressIntervalRef.current);
      return undefined;
    }

    const slideDuration = slideExposureTime * 1000; // converter segundos para ms
    setSlideTimerProgress(0);
    const tickRate = 100;
    const totalTicks = slideDuration / tickRate;
    let ticksElapsed = 0;

    slideProgressIntervalRef.current = setInterval(() => {
      ticksElapsed += 1;
      setSlideTimerProgress(Math.min((ticksElapsed / totalTicks) * 100, 100));
    }, tickRate);

    slideIntervalRef.current = setInterval(handleNextSlide, slideDuration);

    return () => {
      clearInterval(slideIntervalRef.current);
      clearInterval(slideProgressIntervalRef.current);
    };
  }, [isSlideModeActive, isSlideTimerPaused, slideshowNotes.length, handleNextSlide, slideExposureTime]);

  const logActivity = useCallback(
    async (actionText) => {
      if (!profile) return;
      try {
        await api.createActivity({
          userName: profile.name,
          userEmail: profile.email,
          userColor: profile.color,
          action: actionText,
        });
      } catch (error) {
        console.error('Erro ao registrar auditoria:', error);
      }
    },
    [profile],
  );

  const createNotePayload = useCallback(
    (data) => ({
      ...data,
      actorId: profile?.id,
      creatorName: profile?.name || 'Operador',
      creatorEmail: profile?.email || 'operador@local',
    }),
    [profile],
  );

  const handleCreateWork = useCallback(
    async ({ title, content, category, previsao, progresso, color, assignedToUserId }) => {
      const response = await api.createNote(
        createNotePayload({
          title,
          content,
          color,
          category,
          previsao: previsao || 'Sem prazo',
          progresso,
          assignedToUserId: assignedToUserId || null,
        }),
      );
      if (response.note) {
        pendingCreatedNotesRef.current.set(response.note.id, response.note);
        setNotes((currentNotes) => [
          response.note,
          ...currentNotes.filter((note) => note.id !== response.note.id),
        ]);

        Promise.resolve()
          .then(() => logActivity(`cadastrou meta de ${getCategoryObj(category)?.label || 'Design'}: "${title}"`))
          .then(() => refreshData())
          .catch((error) => console.error('Erro ao sincronizar após registrar trabalho:', error))
          .finally(() => {
            pendingCreatedNotesRef.current.delete(response.note.id);
          });
      }

      return response.note;
    },
    [createNotePayload, getCategoryObj, logActivity, refreshData],
  );

  const handleCreateCategory = useCallback(
    async ({ label, iconName, colorTheme }) => {
      const response = await api.createCategory({ actorId: profile?.id, label, iconName, colorTheme });
      if (response.category) {
        pendingCreatedCategoriesRef.current.set(response.category.key, response.category);
        setCategories((currentCategories) =>
          mergeCategories({
            ...currentCategories,
            [response.category.key]: response.category,
          }),
        );

        Promise.resolve()
          .then(() => logActivity(`adicionou a nova categoria de missão: "${label}"`))
          .then(() => refreshData())
          .catch((error) => console.error('Erro ao sincronizar após registrar categoria:', error))
          .finally(() => {
            pendingCreatedCategoriesRef.current.delete(response.category.key);
          });
      }

      return response.category;
    },
    [profile, logActivity, refreshData],
  );

  const handleDeleteCategory = useCallback(
    async (key, label) => {
      if (!profile?.id || !key) return;

      if (DEFAULT_CATEGORY_KEYS.has(key)) {
        notify('Categorias padrão não podem ser removidas.', 'error');
        return;
      }

      const hasNotes = notes.some((note) => note.category === key);
      const confirmed = window.confirm(
        hasNotes
          ? `Excluir a categoria "${label || key}"? As atividades dela serão movidas para Produção Gráfica & Design.`
          : `Excluir a categoria "${label || key}"?`,
      );

      if (!confirmed) return;

      const previousCategories = categories;
      const previousNotes = notes;

      pendingDeletedCategoryKeysRef.current.add(key);
      setCategories((currentCategories) => {
        const nextCategories = { ...currentCategories };
        delete nextCategories[key];
        return mergeCategories(nextCategories);
      });
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.category === key
            ? {
                ...note,
                category: 'design',
              }
            : note,
        ),
      );

      try {
        await api.deleteCategory(key, profile.id);

        if (categoryFilter === key) setCategoryFilter('all');
        if (slideshowCategory === key) setSlideshowCategory('all');
        if (editCategory === key) setEditCategory('design');

        Promise.resolve()
          .then(() => logActivity(`removeu a categoria de missão: "${label || key}"`))
          .then(() => refreshData())
          .catch((error) => console.error('Erro ao sincronizar após remover categoria:', error))
          .finally(() => {
            pendingDeletedCategoryKeysRef.current.delete(key);
          });
        notify(`Categoria "${label || key}" removida.`);
      } catch (error) {
        pendingDeletedCategoryKeysRef.current.delete(key);
        setCategories(previousCategories);
        setNotes(previousNotes);
        console.error('Erro ao remover categoria:', error);
        notify(error.message || 'Não foi possível remover a categoria.', 'error');
      }
    },
    [profile, notes, categories, categoryFilter, slideshowCategory, editCategory, logActivity, refreshData, notify],
  );

  const handleUpdateCategory = useCallback(
    async (key, { label, iconName, colorTheme }) => {
      if (!profile?.id || !key) return null;

      const previousCategories = categories;
      const currentCategory = categories[key] || DEFAULT_CATEGORIES[key] || {};

      setCategories((currentCategories) =>
        mergeCategories({
          ...currentCategories,
          [key]: {
            ...currentCategory,
            label,
            iconName,
          },
        }),
      );

      try {
        const response = await api.updateCategory(key, {
          actorId: profile.id,
          label,
          iconName,
          colorTheme,
        });

        if (response.category) {
          setCategories((currentCategories) =>
            mergeCategories({
              ...currentCategories,
              [response.category.key]: response.category,
            }),
          );
        }

        Promise.resolve()
          .then(() => logActivity(`editou a categoria de missão: "${label}"`))
          .then(() => refreshData())
          .catch((error) => console.error('Erro ao sincronizar após editar categoria:', error));
        return response.category;
      } catch (error) {
        setCategories(previousCategories);
        console.error('Erro ao editar categoria:', error);
        notify(error.message || 'Não foi possível editar a categoria.', 'error');
        throw error;
      }
    },
    [profile, categories, logActivity, refreshData, notify],
  );

  const handleCreateUser = useCallback(
    async ({ name, role }) => {
      if (!profile?.id) return null;
      const response = await api.createUser({
        actorId: profile.id,
        name,
        role,
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });
      await refreshData();
      notify(`Conta criada para ${response.user.name}.`);
      return response.user;
    },
    [profile, refreshData, notify],
  );

  const handleToggleUserAdmin = useCallback(
    async (targetUser) => {
      if (!profile?.id || !targetUser) return;
      const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
      await api.updateUser(targetUser.id, {
        actorId: profile.id,
        role: nextRole,
      });
      await refreshData();
      notify(
        nextRole === 'admin'
          ? `${targetUser.name} agora também é administrador.`
          : `${targetUser.name} voltou para usuário comum.`,
      );
    },
    [profile, refreshData, notify],
  );

  const handleUpdateUser = useCallback(
    async (targetUser, updates) => {
      if (!profile?.id || !targetUser) return null;
      const response = await api.updateUser(targetUser.id, {
        actorId: profile.id,
        ...updates,
      });
      await refreshData();
      notify(`Conta de ${response.user.name} atualizada.`);
      return response.user;
    },
    [profile, refreshData, notify],
  );

  const handleDeleteUser = useCallback(
    async (targetUser) => {
      if (!profile?.id || !targetUser) return;
      await api.deleteUser(targetUser.id, profile.id);
      await refreshData();
      notify(`Conta de ${targetUser.name} excluida.`);
    },
    [profile, refreshData, notify],
  );

  const noteFilterOptions = useMemo(
    () => ({ searchQuery, categoryFilter, sortConfig }),
    [searchQuery, categoryFilter, sortConfig],
  );

  const processedNotes = useMemo(
    () => filterAndSortNotes(activeVisibleNotes, noteFilterOptions),
    [activeVisibleNotes, noteFilterOptions],
  );

  const spreadsheetNotes = useMemo(
    () => filterAndSortNotes(visibleNotes, noteFilterOptions),
    [visibleNotes, noteFilterOptions],
  );

  const spreadsheetSummary = useMemo(() => {
    const userStats = new Map();
    const summary = {
      total: spreadsheetNotes.length,
      completed: 0,
      late: 0,
      inProgress: 0,
      users: [],
    };

    const ensureUser = (note) => {
      const id = note.assignedToUserId || note.creatorEmail || note.creatorName || 'sem-responsavel';
      if (!userStats.has(id)) {
        userStats.set(id, {
          id,
          name: note.assignedToName || note.creatorName || 'Sem responsável',
          completed: 0,
          late: 0,
          inProgress: 0,
          total: 0,
        });
      }

      return userStats.get(id);
    };

    spreadsheetNotes.forEach((note) => {
      const workflowStatus = getNoteWorkflowStatus(note);
      const userStat = ensureUser(note);

      if (workflowStatus === 'completed') {
        summary.completed += 1;
        userStat.completed += 1;
      } else if (workflowStatus === 'late') {
        summary.late += 1;
        userStat.late += 1;
      } else {
        summary.inProgress += 1;
        userStat.inProgress += 1;
      }

      userStat.total += 1;
    });

    summary.users = [...userStats.values()].sort((a, b) => b.total - a.total);
    return summary;
  }, [spreadsheetNotes]);

  const analyticsData = useMemo(() => {
    const contributorStats = {};
    const statusStats = { red: 0, yellow: 0, blue: 0 };
    const categoryStats = {};

    Object.keys(categories).forEach((catKey) => {
      categoryStats[catKey] = 0;
    });

    activeVisibleNotes.forEach((note) => {
      const responsibleName = note.assignedToName || note.creatorName;
      if (responsibleName) contributorStats[responsibleName] = (contributorStats[responsibleName] || 0) + 1;
      if (statusStats[note.color] !== undefined) statusStats[note.color] += 1;
      if (note.category) categoryStats[note.category] = (categoryStats[note.category] || 0) + 1;
    });

    return {
      contributors: Object.entries(contributorStats).map(([name, count]) => ({ name, count })),
      status: Object.entries(statusStats).map(([color, count]) => ({
        label: STATUS_MAP[color]?.label || color,
        count,
        colorCode: STATUS_MAP[color]?.hex || '#cccccc',
      })),
      categories: Object.entries(categoryStats).map(([cat, count]) => {
        const catObj = getCategoryObj(cat);
        return {
          label: catObj.label,
          count,
          key: cat,
        };
      }),
    };
  }, [activeVisibleNotes, categories, getCategoryObj]);

  const monthlyReportData = useMemo(() => {
    const filteredNotes = visibleNotes.filter((note) => {
      if (!note.createdAt) return false;
      const date = new Date(note.createdAt);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === selectedMonth;
    });

    const filteredActivities = activities.filter((activity) => {
      if (!activity.timestamp) return false;
      const date = new Date(activity.timestamp);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === selectedMonth;
    });

    const userReports = {};
    const allUserNames = new Set([
      ...filteredNotes.map((note) => note.assignedToName || note.creatorName),
      ...filteredActivities.map((activity) => activity.userName),
    ]);

    allUserNames.forEach((name) => {
      if (!name) return;
      userReports[name] = {
        name,
        categoriesCount: {},
        redMissions: [],
        yellowMissions: [],
        blueMissions: [],
        actionsCount: 0,
        actions: [],
      };
    });

    filteredNotes.forEach((note) => {
      const userReport = userReports[note.assignedToName || note.creatorName];
      if (!userReport) return;
      userReport.categoriesCount[note.category] = (userReport.categoriesCount[note.category] || 0) + 1;
      if (note.color === 'red') userReport.redMissions.push(note);
      else if (note.color === 'yellow') userReport.yellowMissions.push(note);
      else if (note.color === 'blue') userReport.blueMissions.push(note);
    });

    filteredActivities.forEach((activity) => {
      const userReport = userReports[activity.userName];
      if (!userReport) return;
      userReport.actionsCount += 1;
      userReport.actions.push(activity);
    });

    return Object.values(userReports);
  }, [visibleNotes, activities, selectedMonth]);

  const handleColorChange = async (noteId, newColor) => {
    const updates = {
      actorId: profile?.id,
      color: newColor,
      lastEditedBy: profile?.name || 'Operador',
    };

    await api.updateNote(noteId, {
      ...updates,
    });
    await refreshData();
    notify('Nivel de prioridade operacional modificado.');
  };

  const handleProgressUpdate = async (noteId, newProgress) => {
    const normalizedProgress = Math.max(0, Math.min(100, Number.parseInt(newProgress, 10) || 0));

    await api.updateNote(noteId, {
      actorId: profile?.id,
      progresso: normalizedProgress,
      lastEditedBy: profile?.name || 'Operador',
    });
    await refreshData();
  };

  const handleSaveTextEdit = async (noteId) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    const nextPrevisao = editPrevisao.trim() || 'Sem prazo';

    await api.updateNote(noteId, {
      actorId: profile?.id,
      title: editTitle.trim(),
      content: editContent.trim(),
      category: editCategory,
      previsao: nextPrevisao,
      progresso: Number.parseInt(editProgresso, 10) || 0,
      lastEditedBy: profile?.name || 'Operador',
    });
    setEditingNoteId(null);
    await refreshData();
    notify('Alterações aplicadas com sucesso no quadro de comando.');
  };

  const handleDeleteNote = async (note) => {
    if (!note?.id) return;
    const confirmed = window.confirm(`Excluir definitivamente o trabalho "${note.title}"?`);
    if (!confirmed) return;

    const previousNotes = notes;
    pendingDeletedNoteIdsRef.current.add(note.id);
    setNotes((currentNotes) => currentNotes.filter((currentNote) => currentNote.id !== note.id));

    try {
      await api.deleteNote(note.id, profile?.id);
      Promise.resolve()
        .then(() => logActivity(`excluiu do quadro o trabalho "${note.title}"`))
        .then(() => refreshData())
        .catch((error) => console.error('Erro ao sincronizar após excluir trabalho:', error))
        .finally(() => {
          pendingDeletedNoteIdsRef.current.delete(note.id);
        });
      notify('Trabalho excluído com sucesso.');
    } catch (error) {
      pendingDeletedNoteIdsRef.current.delete(note.id);
      setNotes(previousNotes);
      console.error('Erro ao excluir trabalho:', error);
      notify('Não foi possível excluir o trabalho.', 'error');
    }
  };

  const handleGenerateMissionsBriefing = async () => {
    if (processedNotes.length === 0) {
      notify('Sem dados suficientes para gerar o briefing de situação.', 'error');
      return;
    }

    setIsGeneratingBriefing(true);
    try {
      const critical = processedNotes.filter((note) => note.color === 'red');
      const inExecution = processedNotes.filter((note) => note.color === 'blue');
      const averageProgress = Math.round(
        processedNotes.reduce((sum, note) => sum + (note.progresso || 0), 0) / processedNotes.length,
      );

      const lines = [
        `Briefing operacional gerado localmente em ${new Date().toLocaleString('pt-BR')}.`,
        `Total de missões acompanhadas: ${processedNotes.length}.`,
        `Progresso médio geral: ${averageProgress}%.`,
        `Missões críticas/urgentes: ${critical.length}.`,
        `Missões em execução ou concluídas: ${inExecution.length}.`,
      ];

      if (critical.length > 0) {
        lines.push('');
        lines.push('Prioridades criticas:');
        critical.slice(0, 5).forEach((note, index) => {
          lines.push(`${index + 1}. ${note.title} - ${note.creatorName || 'Sem responsável'} - ${note.progresso || 0}%`);
        });
      }

      setAiBriefingSummary(lines.join('\n'));
      notify('Briefing operacional consolidado com dados do banco.');
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handlePlayVoiceBriefing = async () => {
    if (!aiBriefingSummary) {
      notify('Gere o Briefing de Situação em texto primeiro.', 'error');
      return;
    }

    if (!('speechSynthesis' in window)) {
      notify('Este navegador não oferece leitura de voz local.', 'error');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(aiBriefingSummary);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const exportSpreadsheet = () => {
    exportActivitySpreadsheet({
      notes: spreadsheetNotes,
      summary: spreadsheetSummary,
      getCategoryObj,
    });
    notify('Planilha Excel formatada exportada!');
  };

  const exportMonthlyReport = () => {
    if (monthlyReportData.length === 0) {
      notify('Sem registros consolidados para o mês selecionado.', 'error');
      return;
    }

    let reportText = '==================================================\n';
    reportText += '       RELATÓRIO MENSAL DE PRODUTIVIDADE E ATIVIDADES\n';
    reportText += '       B ADM QGEX - SEÇÃO DE COMUNICAÇÃO SOCIAL\n';
    reportText += `       MÊS DE REFERÊNCIA: ${selectedMonth}\n`;
    reportText += '==================================================\n\n';

    monthlyReportData.forEach((userReport) => {
      reportText += `MILITAR: ${userReport.name.toUpperCase()}\n`;
      reportText += '--------------------------------------------------\n';
      reportText += 'PRODUÇÃO POR SUBÁREA DE COMUNICAÇÃO:\n';
      Object.entries(categories).forEach(([catKey, cat]) => {
        const count = userReport.categoriesCount[catKey] || 0;
        reportText += ` - ${cat.label}: ${count} entregas\n`;
      });
      reportText += '\n';
      reportText += `1. MISSÕES CRÍTICAS / URGENTES (VERMELHO) [${userReport.redMissions.length}]\n`;
      userReport.redMissions.forEach((mission, index) => {
        const catObj = getCategoryObj(mission.category);
        reportText += `   [${index + 1}] Título: ${mission.title} | Subárea: ${catObj.label} | Progresso: ${mission.progresso || 0}%\n`;
      });
      reportText += `\n2. PLANEJAMENTO / IDEIA (AMARELO) [${userReport.yellowMissions.length}]\n`;
      userReport.yellowMissions.forEach((mission, index) => {
        const catObj = getCategoryObj(mission.category);
        reportText += `   [${index + 1}] Título: ${mission.title} | Subárea: ${catObj.label} | Progresso: ${mission.progresso || 0}%\n`;
      });
      reportText += `\n3. EM EXECUÇÃO / CONCLUÍDO (AZUL) [${userReport.blueMissions.length}]\n`;
      userReport.blueMissions.forEach((mission, index) => {
        const catObj = getCategoryObj(mission.category);
        reportText += `   [${index + 1}] Título: ${mission.title} | Subárea: ${catObj.label} | Progresso: ${mission.progresso || 0}%\n`;
      });
      reportText += `\nResumo de Log de Auditoria [${userReport.actionsCount} ações]:\n`;
      userReport.actions.forEach((activity) => {
        reportText += `   - [${new Date(activity.timestamp).toLocaleTimeString()}] ${activity.action}\n`;
      });
      reportText += '\n==================================================\n\n';
    });

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Relatório_Mensal_Produtividade_${selectedMonth}.txt`;
    anchor.click();
    notify('Relatório mensal baixado.');
  };

  const handleSendMessage = async (event, textOverride = null) => {
    if (event) event.preventDefault();
    const text = textOverride || (event ? event.target.elements.chatMsg.value : '');
    if (!text || !text.trim() || !profile) return;

    try {
      await api.sendChatMessage({
        senderName: profile.name,
        senderEmail: profile.email,
        senderColor: profile.color,
        text: text.trim(),
      });
      if (event) event.target.reset();
      await refreshData();
    } catch (error) {
      console.error('Erro ao enviar mensagem no radio:', error);
    }
  };

  return {
    profile,
    setProfile,
    users,
    isAdmin,
    notes,
    activeVisibleNotes,
    userActivityStats,
    chatMessages,
    presenceList,
    activities,
    remainingOrders,
    categories,
    showCategoryModal,
    setShowCategoryModal,
    showModal,
    setShowModal,
    sortConfig,
    setSortConfig,
    toast,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    isSlideModeActive,
    setIsSlideModeActive,
    currentSlideIndex,
    setCurrentSlideIndex,
    isSlideTimerPaused,
    setIsSlideTimerPaused,
    slideTimerProgress,
    slideshowCategory,
    setSlideshowCategory,
    itemsPerSlide,
    setItemsPerSlide,
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
    editProgresso,
    setEditProgresso,
    aiBriefingSummary,
    setAiBriefingSummary,
    isGeneratingBriefing,
    isPlayingAudio,
    selectedMonth,
    setSelectedMonth,
    chatEndRef,
    presetTacticalMessages,
    notify,
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
    logActivity,
    handleGenerateMissionsBriefing,
    handlePlayVoiceBriefing,
    processedNotes,
    spreadsheetNotes,
    spreadsheetSummary,
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
    handleCreateWork,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    exportSpreadsheet,
    exportMonthlyReport,
    handleSendMessage,
  };
}
