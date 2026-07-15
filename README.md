# PlantDex

A personal plant catalog styled as a collectible trading-card binder. Upload a photo, get a
draft species ID + care profile, edit and nickname the card, then track watering, feeding,
and growth over time.

## Stack

- React + Vite + Tailwind, deployed on Vercel
- Supabase (Postgres + Storage) for persistence
- Plant.id API (`api/identify.ts`, a Vercel serverless function) for species identification
- A curated, hand-written care-profile knowledge base (`src/lib/careProfiles.ts`) fills in
  light/water/feed/humidity/toxicity/etc. for ~40 common houseplants plus category-level
  fallbacks, so care profiles are generated for free with no per-upload LLM cost. Every
  field is editable after the draft is created.

## Local development

```bash
npm install
npm run dev
```

`.env` already contains the public Supabase URL and publishable key for the `PlantDex`
Supabase project, so data persistence works out of the box locally.

To enable automatic species identification, add your own Plant.id key to `.env.local`:

```
PLANT_ID_API_KEY=your-plant-id-api-key
```

(Get a free key at https://web.plant.id/api-access-request/.) Without it, uploads still work —
the card is created with a generic draft you fill in by hand.

## Deploying

The app is set up to deploy to Vercel. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are
committed in `.env.production` (safe — Supabase's publishable key is meant to be public,
and access is governed by Postgres row-level security policies). `PLANT_ID_API_KEY` is a
real secret and must be added in the Vercel project's Environment Variables settings
(Production + Preview) — it is never committed.

## Data model

- `plants` — one row per card: nickname, species, category/type, rarity, vigor, full care
  profile, acquisition/location/source metadata, toxicity, notes.
- `plant_photos` — one or more photos per plant (first upload + progress photos over time).
- `care_logs` — timestamped activity log (Watered, Fertilized, Repotted, Pruned, Rotated,
  Pest Treatment, Propagated, Photographed, Other) used to compute "days since" and flag
  overdue plants against each plant's stated water/feed frequency.

## Security note

This is built as a private two-person household app with a simple name picker ("Me" /
"Ashley") instead of real login accounts, per product decision. Row-level security is
enabled on all tables but intentionally permissive (any request with the anon key can
read/write), since there's no per-user auth model. Don't expose the deployed URL publicly
if you'd rather keep the catalog access-controlled — add real Supabase Auth later if that
changes.
