import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CareLog, LogType } from '../lib/types';

export function useCareLogs(plantId: number | null) {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (plantId == null) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .eq('plant_id', plantId)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (!error) setLogs(data as CareLog[]);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addLog = useCallback(
    async (log: { log_type: LogType; log_date: string; note?: string; logged_by?: string }) => {
      if (plantId == null) return;
      const { data, error } = await supabase
        .from('care_logs')
        .insert({ ...log, plant_id: plantId })
        .select()
        .single();
      if (error) throw error;
      setLogs((prev) =>
        [...prev, data as CareLog].sort((a, b) => (a.log_date < b.log_date ? 1 : -1))
      );
      return data as CareLog;
    },
    [plantId]
  );

  const deleteLog = useCallback(async (id: number) => {
    const { error } = await supabase.from('care_logs').delete().eq('id', id);
    if (error) throw error;
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { logs, loading, refresh, addLog, deleteLog };
}

export async function fetchAllRecentLogs(limit = 200): Promise<CareLog[]> {
  const { data, error } = await supabase
    .from('care_logs')
    .select('*')
    .order('log_date', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data as CareLog[];
}

export function useAllCareLogs() {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('care_logs')
      .select('*')
      .order('log_date', { ascending: false });
    if (!error) setLogs(data as CareLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { logs, loading, refresh };
}
