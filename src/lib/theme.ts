import {
  Bug,
  Droplet,
  Flower2,
  Leaf,
  Sprout,
  TreePine,
} from 'lucide-react';
import { PlantCategory, Rarity } from './types';

export interface CategoryTheme {
  label: string;
  icon: typeof Leaf;
  gradient: string;
  ring: string;
  chipBg: string;
  chipText: string;
  glow: string;
}

export const CATEGORY_THEME: Record<PlantCategory, CategoryTheme> = {
  Tropical: {
    label: 'Tropical',
    icon: Leaf,
    gradient: 'from-emerald-500 via-green-600 to-teal-700',
    ring: 'ring-emerald-400/60',
    chipBg: 'bg-emerald-500/15',
    chipText: 'text-emerald-300',
    glow: 'shadow-emerald-500/30',
  },
  Succulent: {
    label: 'Succulent',
    icon: TreePine,
    gradient: 'from-amber-400 via-orange-500 to-yellow-600',
    ring: 'ring-amber-400/60',
    chipBg: 'bg-amber-500/15',
    chipText: 'text-amber-300',
    glow: 'shadow-amber-500/30',
  },
  Fern: {
    label: 'Fern',
    icon: Sprout,
    gradient: 'from-green-700 via-emerald-700 to-teal-800',
    ring: 'ring-green-400/60',
    chipBg: 'bg-green-500/15',
    chipText: 'text-green-300',
    glow: 'shadow-green-500/30',
  },
  Flowering: {
    label: 'Flowering',
    icon: Flower2,
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
    ring: 'ring-pink-400/60',
    chipBg: 'bg-pink-500/15',
    chipText: 'text-pink-300',
    glow: 'shadow-pink-500/30',
  },
  Foliage: {
    label: 'Foliage',
    icon: Leaf,
    gradient: 'from-teal-600 via-cyan-700 to-sky-800',
    ring: 'ring-teal-400/60',
    chipBg: 'bg-teal-500/15',
    chipText: 'text-teal-300',
    glow: 'shadow-teal-500/30',
  },
  Herb: {
    label: 'Herb',
    icon: Sprout,
    gradient: 'from-lime-500 via-green-500 to-emerald-600',
    ring: 'ring-lime-400/60',
    chipBg: 'bg-lime-500/15',
    chipText: 'text-lime-300',
    glow: 'shadow-lime-500/30',
  },
  Carnivorous: {
    label: 'Carnivorous',
    icon: Bug,
    gradient: 'from-violet-600 via-purple-700 to-fuchsia-900',
    ring: 'ring-violet-400/60',
    chipBg: 'bg-violet-500/15',
    chipText: 'text-violet-300',
    glow: 'shadow-violet-500/30',
  },
  Other: {
    label: 'Other',
    icon: Droplet,
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    ring: 'ring-slate-400/60',
    chipBg: 'bg-slate-500/15',
    chipText: 'text-slate-300',
    glow: 'shadow-slate-500/30',
  },
};

export interface RarityTheme {
  label: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  foil: 'none' | 'sheen' | 'holo' | 'holo-strong';
}

export const RARITY_THEME: Record<Rarity, RarityTheme> = {
  Common: {
    label: 'Common',
    border: 'border-slate-600',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-slate-200',
    foil: 'none',
  },
  Uncommon: {
    label: 'Uncommon',
    border: 'border-sky-500',
    badgeBg: 'bg-sky-600',
    badgeText: 'text-sky-50',
    foil: 'sheen',
  },
  Rare: {
    label: 'Rare',
    border: 'border-amber-400',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    badgeText: 'text-amber-950',
    foil: 'holo',
  },
  Holo: {
    label: 'Holo',
    border: 'border-fuchsia-400',
    badgeBg: 'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-amber-300',
    badgeText: 'text-slate-950',
    foil: 'holo-strong',
  },
};
