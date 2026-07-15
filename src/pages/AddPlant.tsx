import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Sparkles } from 'lucide-react';
import PhotoUploader from '../components/PhotoUploader';
import { usePlants } from '../hooks/usePlants';
import { uploadPhotoForPlant } from '../hooks/usePhotos';
import { fileToDataUrl } from '../lib/fileToDataUrl';
import { CareProfileDraft, CATEGORIES, RARITIES } from '../lib/types';
import { useCurrentUser } from '../lib/useCurrentUser';

interface IdentifySuggestion {
  common_name: string;
  scientific_name: string;
  probability: number;
}

interface IdentifyResponse {
  draft: CareProfileDraft;
  suggestions: IdentifySuggestion[];
  warning?: string;
}

const EMPTY_DRAFT: CareProfileDraft = {
  common_name: '',
  scientific_name: '',
  category: 'Other',
  rarity: 'Common',
  light: '',
  water: '',
  water_frequency_days: 7,
  feed: '',
  feed_frequency_days: 30,
  humidity: '',
  temperature: '',
  soil_type: '',
  toxic_to_pets: false,
  toxicity_note: '',
  weakness: '',
  resistance: '',
  flavor_text: '',
  confidence: 0,
};

export default function AddPlant() {
  const navigate = useNavigate();
  const { addPlant } = usePlants();
  const { user } = useCurrentUser();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<IdentifySuggestion[]>([]);
  const [draft, setDraft] = useState<CareProfileDraft | null>(null);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleFile(selected: File) {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setIdentifying(true);
    setWarning(null);
    try {
      const dataUrl = await fileToDataUrl(selected);
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const json = (await res.json()) as IdentifyResponse;
      setDraft(json.draft);
      setSuggestions(json.suggestions ?? []);
      setWarning(json.warning ?? null);
      setNickname(json.draft.common_name || '');
    } catch (err) {
      setDraft(EMPTY_DRAFT);
      setWarning('Could not reach the identification service. Fill in the card manually below.');
    } finally {
      setIdentifying(false);
    }
  }

  function applySuggestion(s: IdentifySuggestion) {
    if (!draft) return;
    setDraft({ ...draft, common_name: s.common_name, scientific_name: s.scientific_name, confidence: s.probability });
    setNickname(s.common_name);
  }

  function set<K extends keyof CareProfileDraft>(key: K, value: CareProfileDraft[K]) {
    if (!draft) return;
    setDraft({ ...draft, [key]: value });
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      const plant = await addPlant({
        nickname: nickname || draft.common_name || 'New Plant',
        common_name: draft.common_name,
        scientific_name: draft.scientific_name,
        category: draft.category,
        rarity: draft.rarity,
        vigor: 80,
        acquisition_date: new Date().toISOString().slice(0, 10),
        source: null,
        location: null,
        pot_size: null,
        soil_type: draft.soil_type,
        toxic_to_pets: draft.toxic_to_pets,
        toxicity_note: draft.toxicity_note,
        light: draft.light,
        water: draft.water,
        water_frequency_days: draft.water_frequency_days,
        feed: draft.feed,
        feed_frequency_days: draft.feed_frequency_days,
        humidity: draft.humidity,
        temperature: draft.temperature,
        weakness: draft.weakness,
        resistance: draft.resistance,
        flavor_text: draft.flavor_text,
        notes: null,
        added_by: user,
        id_confidence: draft.confidence,
      });

      if (file) {
        await uploadPhotoForPlant(plant.id, file, { isPrimary: true });
      }

      navigate(`/plant/${plant.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Add a plant</h1>
        <p className="text-sm text-slate-400">Snap a photo — we'll draft the card, you confirm the details.</p>
      </div>

      <PhotoUploader onFile={handleFile} previewUrl={previewUrl} busy={identifying} />

      {warning && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{warning}</p>
        </div>
      )}

      {suggestions.length > 1 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Sparkles className="h-3.5 w-3.5" /> Not quite right? Other matches:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.scientific_name}
                onClick={() => applySuggestion(s)}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:border-emerald-400"
              >
                {s.common_name} <span className="text-slate-500">({Math.round(s.probability * 100)}%)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {draft && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          {draft.confidence > 0 && (
            <p className="text-xs text-emerald-400">
              Identified with {Math.round(draft.confidence * 100)}% confidence — review before saving.
            </p>
          )}

          <Field label="Nickname">
            <input
              className="input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="What do you call this one?"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Common name">
              <input
                className="input"
                value={draft.common_name}
                onChange={(e) => set('common_name', e.target.value)}
              />
            </Field>
            <Field label="Scientific name">
              <input
                className="input"
                value={draft.scientific_name}
                onChange={(e) => set('scientific_name', e.target.value)}
              />
            </Field>
            <Field label="Type">
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
            <Field label="Light">
              <input className="input" value={draft.light} onChange={(e) => set('light', e.target.value)} />
            </Field>
            <Field label="Humidity">
              <input className="input" value={draft.humidity} onChange={(e) => set('humidity', e.target.value)} />
            </Field>
            <Field label="Water instructions">
              <input className="input" value={draft.water} onChange={(e) => set('water', e.target.value)} />
            </Field>
            <Field label="Water frequency (days)">
              <input
                type="number"
                min={1}
                className="input"
                value={draft.water_frequency_days}
                onChange={(e) => set('water_frequency_days', Number(e.target.value))}
              />
            </Field>
            <Field label="Feed instructions">
              <input className="input" value={draft.feed} onChange={(e) => set('feed', e.target.value)} />
            </Field>
            <Field label="Feed frequency (days)">
              <input
                type="number"
                min={1}
                className="input"
                value={draft.feed_frequency_days}
                onChange={(e) => set('feed_frequency_days', Number(e.target.value))}
              />
            </Field>
            <Field label="Toxic to pets?">
              <select
                className="input"
                value={draft.toxic_to_pets ? 'yes' : 'no'}
                onChange={(e) => set('toxic_to_pets', e.target.value === 'yes')}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </Field>
          </div>

          <Field label="Toxicity note">
            <textarea
              className="input"
              rows={2}
              value={draft.toxicity_note}
              onChange={(e) => set('toxicity_note', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Weakness">
              <input className="input" value={draft.weakness} onChange={(e) => set('weakness', e.target.value)} />
            </Field>
            <Field label="Resistance">
              <input className="input" value={draft.resistance} onChange={(e) => set('resistance', e.target.value)} />
            </Field>
          </div>

          <Field label="Flavor text">
            <textarea
              className="input"
              rows={2}
              value={draft.flavor_text}
              onChange={(e) => set('flavor_text', e.target.value)}
            />
          </Field>

          <button
            onClick={handleSave}
            disabled={saving || !nickname}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> {saving ? 'Saving...' : 'Save to binder'}
          </button>
        </div>
      )}
    </div>
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
