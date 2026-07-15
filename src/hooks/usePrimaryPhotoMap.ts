import { useEffect, useState } from 'react';
import { photoUrl, supabase } from '../lib/supabaseClient';

export function usePrimaryPhotoMap() {
  const [map, setMap] = useState<Record<number, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('plant_photos')
        .select('plant_id, storage_path, is_primary, taken_at')
        .order('taken_at', { ascending: true });
      if (error || !data || cancelled) return;

      const byPlant: Record<number, { storage_path: string; is_primary: boolean }> = {};
      for (const row of data as any[]) {
        const existing = byPlant[row.plant_id];
        if (!existing || (row.is_primary && !existing.is_primary)) {
          byPlant[row.plant_id] = row;
        }
      }
      const urls: Record<number, string> = {};
      for (const [plantId, row] of Object.entries(byPlant)) {
        urls[Number(plantId)] = photoUrl(row.storage_path);
      }
      setMap(urls);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return map;
}
