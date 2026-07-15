import { useCallback, useEffect, useState } from 'react';
import { PLANT_PHOTOS_BUCKET, supabase } from '../lib/supabaseClient';
import { PlantPhoto } from '../lib/types';

export async function uploadPhotoForPlant(
  plantId: number,
  file: File,
  opts?: { isPrimary?: boolean; caption?: string }
): Promise<PlantPhoto> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${plantId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(PLANT_PHOTOS_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('plant_photos')
    .insert({
      plant_id: plantId,
      storage_path: path,
      is_primary: opts?.isPrimary ?? false,
      caption: opts?.caption ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as PlantPhoto;
}

export function usePhotos(plantId: number | null) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (plantId == null) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plant_photos')
      .select('*')
      .eq('plant_id', plantId)
      .order('taken_at', { ascending: false });
    if (!error) setPhotos(data as PlantPhoto[]);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadPhoto = useCallback(
    async (file: File, opts?: { isPrimary?: boolean; caption?: string }) => {
      if (plantId == null) throw new Error('No plant selected');
      const photo = await uploadPhotoForPlant(plantId, file, opts);
      setPhotos((prev) => [photo, ...prev]);
      return photo;
    },
    [plantId]
  );

  const deletePhoto = useCallback(async (photo: PlantPhoto) => {
    await supabase.storage.from(PLANT_PHOTOS_BUCKET).remove([photo.storage_path]);
    const { error } = await supabase.from('plant_photos').delete().eq('id', photo.id);
    if (error) throw error;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }, []);

  return { photos, loading, refresh, uploadPhoto, deletePhoto };
}
