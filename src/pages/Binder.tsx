import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlants } from '../hooks/usePlants';
import { useAllCareLogs } from '../hooks/useCareLogs';
import { usePrimaryPhotoMap } from '../hooks/usePrimaryPhotoMap';
import { computeAllOverdue } from '../lib/dex';
import PlantCard from '../components/PlantCard';
import FilterBar, { DEFAULT_FILTERS } from '../components/FilterBar';

export default function Binder() {
  const { plants, loading } = usePlants();
  const { logs } = useAllCareLogs();
  const photoMap = usePrimaryPhotoMap();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const overdueMap = useMemo(() => computeAllOverdue(plants, logs), [plants, logs]);

  const locations = useMemo(
    () => Array.from(new Set(plants.map((p) => p.location).filter(Boolean) as string[])).sort(),
    [plants]
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return plants.filter((p) => {
      if (filters.category !== 'All' && p.category !== filters.category) return false;
      if (filters.rarity !== 'All' && p.rarity !== filters.rarity) return false;
      if (filters.location !== 'All' && p.location !== filters.location) return false;
      if (filters.needsAttention && !overdueMap[p.id]?.needsAttention) return false;
      if (search) {
        const haystack = `${p.nickname} ${p.common_name} ${p.scientific_name}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [plants, filters, overdueMap]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">The Binder</h1>
          <p className="text-sm text-slate-400">
            {plants.length} plant{plants.length === 1 ? '' : 's'} collected
          </p>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} locations={locations} />

      {loading ? (
        <p className="py-16 text-center text-slate-500">Loading your collection...</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-slate-500">
          {plants.length === 0
            ? 'No plants yet — add your first one to start the binder.'
            : 'No plants match these filters.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              imageUrl={photoMap[plant.id]}
              overdue={overdueMap[plant.id]?.needsAttention}
              onClick={() => navigate(`/plant/${plant.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
