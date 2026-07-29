import {
  Award,
  Calendar,
  Info,
  MessageSquare,
  Palette,
  Shield,
  Tv,
  Users,
  Video,
} from 'lucide-react';

export const DEFAULT_CATEGORIES = {
  design: {
    label: 'Produção Gráfica & Design',
    iconName: 'Palette',
    bg: 'bg-purple-950/90 text-purple-300 border border-purple-500/30',
  },
  audiovisual: {
    label: 'Audiovisual (Foto/Vídeo)',
    iconName: 'Video',
    bg: 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/30',
  },
  cards: {
    label: 'Cartões de Felicitações',
    iconName: 'Award',
    bg: 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30',
  },
};

export const getCategoryIcon = (iconName) => {
  const map = {
    Palette,
    Video,
    Award,
    Shield,
    Calendar,
    MessageSquare,
    Users,
    Tv,
    Info,
  };

  return map[iconName] || Palette;
};

export const STATUS_MAP = {
  red: {
    label: 'Crítico / Urgente',
    bg: 'bg-red-700 hover:bg-red-800',
    border: 'border-red-500',
    text: 'text-white',
    badge: 'bg-red-950/80 text-red-300 border border-red-500/30',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.25)]',
    hex: '#ef4444',
  },
  yellow: {
    label: 'Planejamento / Ideia',
    bg: 'bg-amber-500 hover:bg-amber-600',
    border: 'border-amber-400',
    text: 'text-slate-950',
    badge: 'bg-amber-950/80 text-amber-300 border border-amber-500/30',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    hex: '#f59e0b',
  },
  blue: {
    label: 'Em Execução / Concluído',
    bg: 'bg-blue-600 hover:bg-blue-750',
    border: 'border-blue-500',
    text: 'text-white',
    badge: 'bg-blue-950/80 text-blue-300 border border-blue-500/30',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    hex: '#3b82f6',
  },
};


export const AVATAR_COLORS = [
  'bg-red-700',
  'bg-blue-700',
  'bg-amber-500',
  'bg-slate-700',
  'bg-emerald-700',
  'bg-violet-600',
  'bg-fuchsia-600',
];
