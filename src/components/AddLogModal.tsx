import { useState } from 'react';
import { X } from 'lucide-react';
import { LOG_TYPES, LogType } from '../lib/types';
import { useCurrentUser } from '../lib/useCurrentUser';

interface AddLogModalProps {
  onClose: () => void;
  onSubmit: (log: { log_type: LogType; log_date: string; note?: string; logged_by?: string }) => Promise<void>;
}

export default function AddLogModal({ onClose, onSubmit }: AddLogModalProps) {
  const { user } = useCurrentUser();
  const [logType, setLogType] = useState<LogType>('Watered');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ log_type: logType, log_date: logDate, note: note || undefined, logged_by: user });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-slate-900 p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Log care activity</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Activity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LOG_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setLogType(type)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                    logType === type
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              placeholder="Anything worth remembering?"
            />
          </div>

          <p className="text-xs text-slate-500">Logged by {user}</p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save log entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
