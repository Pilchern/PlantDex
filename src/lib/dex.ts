import { differenceInCalendarDays, parseISO } from 'date-fns';
import { CareLog, Plant } from './types';

export function daysSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  const date = dateString.length === 10 ? parseISO(dateString) : new Date(dateString);
  return differenceInCalendarDays(new Date(), date);
}

export function lastLogOfType(logs: CareLog[], type: string): CareLog | null {
  const matches = logs
    .filter((l) => l.log_type === type)
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1));
  return matches[0] ?? null;
}

export interface OverdueStatus {
  wateringOverdue: boolean;
  wateringDaysSince: number | null;
  feedingOverdue: boolean;
  feedingDaysSince: number | null;
  needsAttention: boolean;
}

export function computeOverdueStatus(plant: Plant, logs: CareLog[]): OverdueStatus {
  const lastWatered = lastLogOfType(logs, 'Watered');
  const lastFed = lastLogOfType(logs, 'Fertilized');

  const wateringDaysSince = lastWatered ? daysSince(lastWatered.log_date) : daysSince(plant.acquisition_date);
  const feedingDaysSince = lastFed ? daysSince(lastFed.log_date) : null;

  const wateringOverdue =
    plant.water_frequency_days != null &&
    wateringDaysSince != null &&
    wateringDaysSince > plant.water_frequency_days;

  const feedingOverdue =
    plant.feed_frequency_days != null &&
    feedingDaysSince != null &&
    feedingDaysSince > plant.feed_frequency_days;

  return {
    wateringOverdue,
    wateringDaysSince,
    feedingOverdue,
    feedingDaysSince,
    needsAttention: wateringOverdue || feedingOverdue,
  };
}

export function dexNumber(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function groupLogsByPlant(logs: CareLog[]): Record<number, CareLog[]> {
  const grouped: Record<number, CareLog[]> = {};
  for (const log of logs) {
    (grouped[log.plant_id] ??= []).push(log);
  }
  return grouped;
}

export function computeAllOverdue(plants: Plant[], logs: CareLog[]): Record<number, OverdueStatus> {
  const grouped = groupLogsByPlant(logs);
  const result: Record<number, OverdueStatus> = {};
  for (const plant of plants) {
    result[plant.id] = computeOverdueStatus(plant, grouped[plant.id] ?? []);
  }
  return result;
}
