import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, FlaskConical, Layers, Sprout } from 'lucide-react';
import { usePlants } from '../hooks/usePlants';
import { useAllCareLogs } from '../hooks/useCareLogs';
import { usePrimaryPhotoMap } from '../hooks/usePrimaryPhotoMap';
import { computeAllOverdue } from '../lib/dex';
import { CATEGORY_THEME } from '../lib/theme';
import { CATEGORIES } from '../lib/types';
import PlantCard from '../components/PlantCard';

export default function Dashboard() {
  const { plants, loading } = usePlants();
  const { logs } = useAllCareLogs();
  const photoMap = usePrimaryPhotoMap();
  const navigate = useNavigate();

  const overdueMap = useMemo(() => computeAllOverdue(plants, logs), [plants, logs]);

  const needsWater = useMemo(
    () => plants.filter((p) => overdueMap[p.id]?.wateringOverdue),
    [plants, overdueMap]
  );
  const needsFeed = useMemo(
    () => plants.filter((p) => overdueMap[p.id]?.feedingOverdue),
    [plants, overdueMap]
  );

  const newest = useMemo(
    () =>
      [...plants]
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 5),
    [plants]
  );

  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of plants) counts[p.category] = (counts[p.category] ?? 0) + 1;
    return counts;
  }, [plants]);

  if (loading) {
    return <p className="py-16 text-center text-slate-500">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">A quick look at what needs your attention this week.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={Layers} label="Total plants" value={plants.length} accent="text-emerald-400" />
        <StatTile icon={Droplets} label="Need water" value={needsWater.length} accent="text-sky-400" />
        <StatTile icon={FlaskConical} label="Need feeding" value={needsFeed.length} accent="text-amber-400" />
        <StatTile
          icon={Sprout}
          label="Types represented"
          value={Object.keys(byCategory).length}
          accent="text-pink-400"
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
          Needs attention this week
        </h2>
        {needsWater.length === 0 && needsFeed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-slate-500">
            Nothing overdue — everyone's happy. 🌿
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {Array.from(new Set([...needsWater, ...needsFeed])).map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                imageUrl={photoMap[plant.id]}
                overdue
                onClick={() => navigate(`/plant/${plant.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Newest additions</h2>
        {newest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 py-8 text-center text-slate-500">
            No plants yet.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
            {newest.map((plant) => (
              <button
                key={plant.id}
                onClick={() => navigate(`/plant/${plant.id}`)}
                className="w-36 shrink-0 text-left"
              >
                <PlantCard plant={plant} imageUrl={photoMap[plant.id]} overdue={overdueMap[plant.id]?.needsAttention} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Breakdown by type</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CATEGORIES.map((category) => {
            const theme = CATEGORY_THEME[category];
            const Icon = theme.icon;
            const count = byCategory[category] ?? 0;
            if (count === 0) return null;
            return (
              <div
                key={category}
                className={`flex items-center gap-2 rounded-xl border border-white/10 p-3 ${theme.chipBg}`}
              >
                <Icon className={`h-5 w-5 ${theme.chipText}`} />
                <div>
                  <p className={`text-lg font-bold ${theme.chipText}`}>{count}</p>
                  <p className="text-xs text-slate-400">{theme.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Layers;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon className={`mb-2 h-5 w-5 ${accent}`} />
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
