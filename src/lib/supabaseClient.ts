import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set them in your Vercel project (or .env.local) for PlantDex to persist data.'
  );
}

export const supabase = createClient(url ?? '', key ?? '');

export const PLANT_PHOTOS_BUCKET = 'plant-photos';

export function photoUrl(storagePath: string): string {
  const { data } = supabase.storage.from(PLANT_PHOTOS_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
