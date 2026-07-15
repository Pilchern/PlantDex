import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { fetchPlant, usePlants } from '../hooks/usePlants';
import { useCareLogs } from '../hooks/useCareLogs';
import { usePhotos } from '../hooks/usePhotos';
import { Plant, CATEGORIES, RARITIES } from '../lib/types';
import { photoUrl } from '../lib/supabaseClient';
import { computeOverdueStatus } from '../lib/dex';
import PlantCard from '../components/PlantCard';
import CareLogTimeline from '../components/CareLogTimeline';
import AddLogModal from '../components/AddLogModal';
import PhotoUploader from '../components/PhotoUploader';
import { KNOWN_USERS } from '../lib/useCurrentUser';

export default function CardDetail() {
  const { id } = useParams();
  const plantId = Number(id);
  const navigate = useNavigate();
  const { updatePlant, archivePlant } = usePlants();
  const { logs, addLog, deleteLog } = useCareLogs(plantId);
  const { photos, uploadPhoto, deletePhoto } = usePhotos(plantId);

  const [plant, setPlant] = useState<Plant | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Plant | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPlant(plantId).then(setPlant);
  }, [plantId]);

  if (!plant) {
    return <p className="py-16 text-center text-slate-500">Loading card...</p>;
  }

  const overdue = computeOverdueStatus(plant, logs);
  const primaryPhoto = photos.find((p) => p.is_primary) ?? photos[0];

  function startEdit() {
    setDraft(plant);
    setEditing(true);
  }

  async function saveEdit() {
    if (!draft) return;
    const { id: _id, created_at, updated_at, archived, ...patch } = draft;
    const updated = await updatePlant(plantId, patch);
    setPlant(updated);
    setEditing(false);
  }

  async function handleArchive() {
    if (!confirm(`Remove ${plant?.nickname} from the binder? This can't be undone here.`)) return;
    await archivePlant(plantId);
    navigate('/binder');
  }

  async function handleAddPhoto(file: File) {
    setUploading(true);
    try {
      await uploadPhoto(file, { isPrimary: photos.length === 0 });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <button
        onClick={() => navigate('/binder')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to binder
      </button>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <PlantCard
            plant={editing && draft ? draft : plant}
            imageUrl={primaryPhoto ? photoUrl(primaryPhoto.storage_path) : undefined}
            size="lg"
          />

          {!editing ? (
            <div className="flex w-full max-w-sm gap-2">
              <button
                onClick={startEdit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                <Pencil className="h-4 w-4" /> Edit card
              </button>
              <button
                onClick={handleArchive}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex w-full max-w-sm gap-2">
              <button
                onClick={saveEdit}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Check className="h-4 w-4" /> Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {(overdue.wateringDaysSince != null || overdue.feedingDaysSince != null) && (
            <div className="w-full max-w-sm space-y-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              {overdue.wateringDaysSince != null && (
                <p className={overdue.wateringOverdue ? 'font-semibold text-red-300' : 'text-slate-300'}>
                  💧 {overdue.wateringDaysSince} days since watered
                  {overdue.wateringOverdue ? ' — overdue' : ''}
                </p>
              )}
              {overdue.feedingDaysSince != null && (
                <p className={overdue.feedingOverdue ? 'font-semibold text-red-300' : 'text-slate-300'}>
                  🌱 {overdue.feedingDaysSince} days since fed
                  {overdue.feedingOverdue ? ' — overdue' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {editing && draft ? (
            <EditForm draft={draft} setDraft={setDraft} />
          ) : (
            <DetailsView plant={plant} />
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Progress photos</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl">
                  <img src={photoUrl(photo.storage_path)} className="h-full w-full object-cover" />
                  {photo.is_primary && (
                    <span className="absolute left-1 top-1 rounded-full bg-emerald-500 p-1">
                      <Star className="h-3 w-3 text-slate-950" fill="currentColor" />
                    </span>
                  )}
                  <button
                    onClick={() => deletePhoto(photo)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-red-300" />
                  </button>
                </div>
              ))}
              <PhotoUploader onFile={handleAddPhoto} busy={uploading} compact label="Add photo" />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Care timeline</h2>
              <button
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                <Plus className="h-3.5 w-3.5" /> Add log
              </button>
            </div>
            <CareLogTimeline logs={logs} onDelete={deleteLog} />
          </section>
        </div>
      </div>

      {showLogModal && (
        <AddLogModal onClose={() => setShowLogModal(false)} onSubmit={(log) => addLog(log).then(() => {})} />
      )}
    </div>
  );
}

function DetailsView({ plant }: { plant: Plant }) {
  const rows: [string, string | number | null][] = [
    ['Common name', plant.common_name],
    ['Scientific name', plant.scientific_name],
    ['Acquired', plant.acquisition_date],
    ['Source', plant.source],
    ['Location', plant.location],
    ['Pot size', plant.pot_size],
    ['Soil type', plant.soil_type],
    ['Toxic to pets', plant.toxic_to_pets == null ? null : plant.toxic_to_pets ? 'Yes' : 'No'],
    ['Toxicity note', plant.toxicity_note],
    ['Temperature', plant.temperature],
    ['Added by', plant.added_by],
    ['ID confidence', plant.id_confidence != null ? `${Math.round(plant.id_confidence * 100)}%` : null],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Details</h2>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows
          .filter(([, v]) => v != null && v !== '')
          .map(([label, value]) => (
            <div key={label} className="flex justify-between gap-2 border-b border-white/5 py-1 text-sm">
              <dt className="text-slate-400">{label}</dt>
              <dd className="text-right font-medium text-white">{value}</dd>
            </div>
          ))}
      </dl>
      {plant.notes && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</p>
          <p className="text-sm text-slate-200">{plant.notes}</p>
        </div>
      )}
    </section>
  );
}

function EditForm({ draft, setDraft }: { draft: Plant; setDraft: (p: Plant) => void }) {
  function set<K extends keyof Plant>(key: K, value: Plant[K]) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">Edit card</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Nickname">
          <input className="input" value={draft.nickname} onChange={(e) => set('nickname', e.target.value)} />
        </Field>
        <Field label="Common name">
          <input className="input" value={draft.common_name} onChange={(e) => set('common_name', e.target.value)} />
        </Field>
        <Field label="Scientific name">
          <input
            className="input"
            value={draft.scientific_name}
            onChange={(e) => set('scientific_name', e.target.value)}
          />
        </Field>
        <Field label="Category">
          <select className="input" value={draft.category} onChange={(e) => set('category', e.target.value as any)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rarity">
          <select className="input" value={draft.rarity} onChange={(e) => set('rarity', e.target.value as any)}>
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Vigor (${draft.vigor})`}>
          <input
            type="range"
            min={1}
            max={100}
            className="w-full accent-emerald-400"
            value={draft.vigor}
            onChange={(e) => set('vigor', Number(e.target.value))}
          />
        </Field>
        <Field label="Acquisition date">
          <input
            type="date"
            className="input"
            value={draft.acquisition_date ?? ''}
            onChange={(e) => set('acquisition_date', e.target.value || null)}
          />
        </Field>
        <Field label="Source">
          <input className="input" value={draft.source ?? ''} onChange={(e) => set('source', e.target.value)} />
        </Field>
        <Field label="Location">
          <input className="input" value={draft.location ?? ''} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field label="Pot size">
          <input className="input" value={draft.pot_size ?? ''} onChange={(e) => set('pot_size', e.target.value)} />
        </Field>
        <Field label="Soil type">
          <input className="input" value={draft.soil_type ?? ''} onChange={(e) => set('soil_type', e.target.value)} />
        </Field>
        <Field label="Toxic to pets?">
          <select
            className="input"
            value={draft.toxic_to_pets == null ? 'unknown' : draft.toxic_to_pets ? 'yes' : 'no'}
            onChange={(e) =>
              set('toxic_to_pets', e.target.value === 'unknown' ? null : e.target.value === 'yes')
            }
          >
            <option value="unknown">Unknown</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
        <Field label="Added by">
          <select className="input" value={draft.added_by ?? ''} onChange={(e) => set('added_by', e.target.value)}>
            <option value="">—</option>
            {KNOWN_USERS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Toxicity note">
        <textarea
          className="input"
          rows={2}
          value={draft.toxicity_note ?? ''}
          onChange={(e) => set('toxicity_note', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Light">
          <input className="input" value={draft.light ?? ''} onChange={(e) => set('light', e.target.value)} />
        </Field>
        <Field label="Temperature">
          <input
            className="input"
            value={draft.temperature ?? ''}
            onChange={(e) => set('temperature', e.target.value)}
          />
        </Field>
        <Field label="Water instructions">
          <input className="input" value={draft.water ?? ''} onChange={(e) => set('water', e.target.value)} />
        </Field>
        <Field label="Water frequency (days)">
          <input
            type="number"
            min={1}
            className="input"
            value={draft.water_frequency_days ?? ''}
            onChange={(e) => set('water_frequency_days', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Feed instructions">
          <input className="input" value={draft.feed ?? ''} onChange={(e) => set('feed', e.target.value)} />
        </Field>
        <Field label="Feed frequency (days)">
          <input
            type="number"
            min={1}
            className="input"
            value={draft.feed_frequency_days ?? ''}
            onChange={(e) => set('feed_frequency_days', e.target.value ? Number(e.target.value) : null)}
          />
        </Field>
        <Field label="Humidity">
          <input className="input" value={draft.humidity ?? ''} onChange={(e) => set('humidity', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Weakness">
          <input className="input" value={draft.weakness ?? ''} onChange={(e) => set('weakness', e.target.value)} />
        </Field>
        <Field label="Resistance">
          <input
            className="input"
            value={draft.resistance ?? ''}
            onChange={(e) => set('resistance', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Flavor text">
        <textarea
          className="input"
          rows={2}
          value={draft.flavor_text ?? ''}
          onChange={(e) => set('flavor_text', e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <textarea className="input" rows={3} value={draft.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Field>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}
