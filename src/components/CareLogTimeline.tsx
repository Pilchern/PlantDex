import { format, parseISO } from 'date-fns';
import {
  Bug,
  Camera,
  Droplets,
  FlaskConical,
  MoreHorizontal,
  RotateCw,
  Scissors,
  Shovel,
  Sprout,
  Trash2,
} from 'lucide-react';
import { CareLog, LogType } from '../lib/types';

const LOG_ICONS: Record<LogType, typeof Droplets> = {
  Watered: Droplets,
  Fertilized: FlaskConical,
  Repotted: Shovel,
  Pruned: Scissors,
  Rotated: RotateCw,
  'Pest Treatment': Bug,
  Propagated: Sprout,
  Photographed: Camera,
  Other: MoreHorizontal,
};

const LOG_COLORS: Record<LogType, string> = {
  Watered: 'text-sky-400 bg-sky-500/15',
  Fertilized: 'text-amber-400 bg-amber-500/15',
  Repotted: 'text-orange-400 bg-orange-500/15',
  Pruned: 'text-emerald-400 bg-emerald-500/15',
  Rotated: 'text-violet-400 bg-violet-500/15',
  'Pest Treatment': 'text-red-400 bg-red-500/15',
  Propagated: 'text-teal-400 bg-teal-500/15',
  Photographed: 'text-pink-400 bg-pink-500/15',
  Other: 'text-slate-400 bg-slate-500/15',
};

interface CareLogTimelineProps {
  logs: CareLog[];
  onDelete?: (id: number) => void;
}

export default function CareLogTimeline({ logs, onDelete }: CareLogTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
        No care logged yet. Add the first entry below.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {logs.map((log) => {
        const Icon = LOG_ICONS[log.log_type] ?? MoreHorizontal;
        const color = LOG_COLORS[log.log_type] ?? LOG_COLORS.Other;
        return (
          <li
            key={log.id}
            className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="text-sm font-semibold text-white">{log.log_type}</span>
                <span className="text-xs text-slate-400">
                  {format(parseISO(log.log_date), 'MMM d, yyyy')}
                  {log.logged_by ? ` · ${log.logged_by}` : ''}
                </span>
              </div>
              {log.note && <p className="mt-0.5 text-sm text-slate-300">{log.note}</p>}
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(log.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-600 opacity-0 transition-opacity hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                aria-label="Delete log entry"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
