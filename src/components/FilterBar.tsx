import { Search } from 'lucide-react';
import clsx from 'clsx';
import { CATEGORIES, RARITIES, PlantCategory, Rarity } from '../lib/types';

export interface Filters {
  search: string;
  category: PlantCategory | 'All';
  location: string | 'All';
  rarity: Rarity | 'All';
  needsAttention: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  category: 'All',
  location: 'All',
  rarity: 'All',
  needsAttention: false,
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  locations: string[];
}

export default function FilterBar({ filters, onChange, locations }: FilterBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by nickname or species..."
          className="w-full rounded-xl border border-white/10 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
        />
      </div>

      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value as Filters['category'] })}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
      >
        <option value="All">All types</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.rarity}
        onChange={(e) => onChange({ ...filters, rarity: e.target.value as Filters['rarity'] })}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
      >
        <option value="All">All rarities</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={filters.location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
        className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
      >
        <option value="All">All locations</option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onChange({ ...filters, needsAttention: !filters.needsAttention })}
        className={clsx(
          'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
          filters.needsAttention
            ? 'border-red-400 bg-red-500/20 text-red-300'
            : 'border-white/10 bg-slate-900 text-slate-300 hover:border-red-400/50'
        )}
      >
        Needs attention
      </button>
    </div>
  );
}
