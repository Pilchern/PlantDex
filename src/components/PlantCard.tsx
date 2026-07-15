import { useRef, useState } from 'react';
import clsx from 'clsx';
import { Droplets, Flame, Heart, Shield, Swords, Thermometer } from 'lucide-react';
import { Plant } from '../lib/types';
import { CATEGORY_THEME, RARITY_THEME } from '../lib/theme';
import { dexNumber } from '../lib/dex';

interface PlantCardProps {
  plant: Plant;
  imageUrl?: string | null;
  size?: 'sm' | 'lg';
  overdue?: boolean;
  onClick?: () => void;
}

export default function PlantCard({ plant, imageUrl, size = 'sm', overdue, onClick }: PlantCardProps) {
  const theme = CATEGORY_THEME[plant.category] ?? CATEGORY_THEME.Other;
  const rarity = RARITY_THEME[plant.rarity] ?? RARITY_THEME.Common;
  const Icon = theme.icon;
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const foilClass =
    rarity.foil === 'holo-strong'
      ? 'foil-holo foil-holo-strong'
      : rarity.foil === 'holo'
      ? 'foil-holo'
      : rarity.foil === 'sheen'
      ? 'foil-sheen'
      : '';

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (rarity.foil === 'none' || rarity.foil === 'sheen') return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - y) * 10,
      ry: (x - 0.5) * 10,
      mx: x * 100,
      my: y * 100,
    });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={clsx(
        'card-tilt relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border-2 bg-slate-900 p-3 shadow-xl',
        rarity.border,
        rarity.foil !== 'none' && 'shadow-2xl',
        foilClass,
        size === 'lg' ? 'w-full max-w-sm' : 'w-full'
      )}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        ['--mx' as string]: `${tilt.mx}%`,
        ['--my' as string]: `${tilt.my}%`,
      }}
    >
      {rarity.foil === 'sheen' && <div className="sheen-overlay" />}
      {(rarity.foil === 'holo' || rarity.foil === 'holo-strong') && (
        <div
          className="foil-overlay animate-holoshift"
          style={{ backgroundPosition: `${tilt.mx}% ${tilt.my}%` }}
        />
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-md bg-black/40 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-300">
          {dexNumber(plant.id)}
        </span>
        <span
          className={clsx(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
            rarity.badgeBg,
            rarity.badgeText
          )}
        >
          {rarity.label}
        </span>
      </div>

      <div
        className={clsx(
          'relative mb-2 aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br',
          theme.gradient
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={plant.nickname} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="h-16 w-16 text-white/70" strokeWidth={1.5} />
          </div>
        )}
        {overdue && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
            <Droplets className="h-3 w-3" /> Needs care
          </div>
        )}
      </div>

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight text-white">{plant.nickname}</h3>
          <p className="truncate text-[11px] italic text-slate-400">
            {plant.scientific_name || plant.common_name || 'Unidentified'}
          </p>
        </div>
        <span
          className={clsx(
            'flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
            theme.chipBg,
            theme.chipText
          )}
        >
          <Icon className="h-3 w-3" /> {theme.label}
        </span>
      </div>

      <div className="mb-2 flex items-center gap-1.5">
        <Heart className="h-3.5 w-3.5 text-rose-400" />
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
          <div
            className={clsx(
              'h-full rounded-full',
              plant.vigor > 60 ? 'bg-emerald-400' : plant.vigor > 30 ? 'bg-amber-400' : 'bg-red-500'
            )}
            style={{ width: `${plant.vigor}%` }}
          />
        </div>
        <span className="w-7 text-right text-[10px] font-bold text-slate-300">{plant.vigor}</span>
      </div>

      {size === 'lg' && (
        <div className="space-y-1.5 rounded-xl bg-black/30 p-2.5 text-[11px] text-slate-200">
          <MoveRow icon={Flame} label="Light" value={plant.light} />
          <MoveRow icon={Droplets} label="Water" value={plant.water} />
          <MoveRow icon={Thermometer} label="Feed" value={plant.feed} />
          <MoveRow icon={Thermometer} label="Humidity" value={plant.humidity} />

          <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-1.5">
            <div className="flex items-center gap-1 text-red-300">
              <Swords className="h-3 w-3 shrink-0" />
              <span className="truncate" title={plant.weakness ?? ''}>
                {plant.weakness || '—'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sky-300">
              <Shield className="h-3 w-3 shrink-0" />
              <span className="truncate" title={plant.resistance ?? ''}>
                {plant.resistance || '—'}
              </span>
            </div>
          </div>

          {plant.flavor_text && (
            <p className="border-t border-white/10 pt-1.5 italic text-slate-400">{plant.flavor_text}</p>
          )}
        </div>
      )}
    </div>
  );
}

function MoveRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
      <span className="font-semibold text-slate-300">{label}:</span>
      <span className="text-slate-200">{value || '—'}</span>
    </div>
  );
}
