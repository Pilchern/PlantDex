import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NewPlant, Plant } from '../lib/types';

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('archived', false)
      .order('id', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setPlants(data as Plant[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlant = useCallback(async (plant: NewPlant): Promise<Plant> => {
    const { data, error } = await supabase.from('plants').insert(plant).select().single();
    if (error) throw error;
    setPlants((prev) => [...prev, data as Plant]);
    return data as Plant;
  }, []);

  const updatePlant = useCallback(async (id: number, patch: Partial<Plant>) => {
    const { data, error } = await supabase.from('plants').update(patch).eq('id', id).select().single();
    if (error) throw error;
    setPlants((prev) => prev.map((p) => (p.id === id ? (data as Plant) : p)));
    return data as Plant;
  }, []);

  const archivePlant = useCallback(async (id: number) => {
    const { error } = await supabase.from('plants').update({ archived: true }).eq('id', id);
    if (error) throw error;
    setPlants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { plants, loading, error, refresh, addPlant, updatePlant, archivePlant };
}

export async function fetchPlant(id: number): Promise<Plant | null> {
  const { data, error } = await supabase.from('plants').select('*').eq('id', id).single();
  if (error) return null;
  return data as Plant;
}
