export type PlantCategory =
  | 'Tropical'
  | 'Succulent'
  | 'Fern'
  | 'Flowering'
  | 'Foliage'
  | 'Herb'
  | 'Carnivorous'
  | 'Other';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Holo';

export type LogType =
  | 'Watered'
  | 'Fertilized'
  | 'Repotted'
  | 'Pruned'
  | 'Rotated'
  | 'Pest Treatment'
  | 'Propagated'
  | 'Photographed'
  | 'Other';

export const LOG_TYPES: LogType[] = [
  'Watered',
  'Fertilized',
  'Repotted',
  'Pruned',
  'Rotated',
  'Pest Treatment',
  'Propagated',
  'Photographed',
  'Other',
];

export const CATEGORIES: PlantCategory[] = [
  'Tropical',
  'Succulent',
  'Fern',
  'Flowering',
  'Foliage',
  'Herb',
  'Carnivorous',
  'Other',
];

export const RARITIES: Rarity[] = ['Common', 'Uncommon', 'Rare', 'Holo'];

export interface Plant {
  id: number;
  nickname: string;
  common_name: string;
  scientific_name: string;
  category: PlantCategory;
  rarity: Rarity;
  vigor: number;
  acquisition_date: string | null;
  source: string | null;
  location: string | null;
  pot_size: string | null;
  soil_type: string | null;
  toxic_to_pets: boolean | null;
  toxicity_note: string | null;
  light: string | null;
  water: string | null;
  water_frequency_days: number | null;
  feed: string | null;
  feed_frequency_days: number | null;
  humidity: string | null;
  temperature: string | null;
  weakness: string | null;
  resistance: string | null;
  flavor_text: string | null;
  notes: string | null;
  added_by: string | null;
  id_confidence: number | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export type NewPlant = Omit<Plant, 'id' | 'created_at' | 'updated_at' | 'archived'>;

export interface PlantPhoto {
  id: number;
  plant_id: number;
  storage_path: string;
  is_primary: boolean;
  caption: string | null;
  taken_at: string;
  created_at: string;
}

export interface CareLog {
  id: number;
  plant_id: number;
  log_type: LogType;
  log_date: string;
  note: string | null;
  logged_by: string | null;
  created_at: string;
}

export interface CareProfileDraft {
  common_name: string;
  scientific_name: string;
  category: PlantCategory;
  rarity: Rarity;
  light: string;
  water: string;
  water_frequency_days: number;
  feed: string;
  feed_frequency_days: number;
  humidity: string;
  temperature: string;
  soil_type: string;
  toxic_to_pets: boolean;
  toxicity_note: string;
  weakness: string;
  resistance: string;
  flavor_text: string;
  confidence: number;
}
