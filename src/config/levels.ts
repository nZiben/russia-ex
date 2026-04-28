import type { LevelDefinition, LevelId } from '../state/types';
import { ALL_LEVEL_IDS } from '../state/types';

export const LEVELS: LevelDefinition[] = [
  {
    id: 'LIVED',
    weight: 5,
    color: '#ff7f8d',
    nameKey: 'level.LIVED.name',
    descriptionKey: 'level.LIVED.description',
  },
  {
    id: 'SHORT_STAY',
    weight: 4,
    color: '#ffb96c',
    nameKey: 'level.SHORT_STAY.name',
    descriptionKey: 'level.SHORT_STAY.description',
  },
  {
    id: 'TRAVELED',
    weight: 3,
    color: '#ffe48f',
    nameKey: 'level.TRAVELED.name',
    descriptionKey: 'level.TRAVELED.description',
  },
  {
    id: 'BUSINESS_TRIP',
    weight: 2,
    color: '#9de5b5',
    nameKey: 'level.BUSINESS_TRIP.name',
    descriptionKey: 'level.BUSINESS_TRIP.description',
  },
  {
    id: 'TRANSIT',
    weight: 1,
    color: '#7da8ff',
    nameKey: 'level.TRANSIT.name',
    descriptionKey: 'level.TRANSIT.description',
  },
  {
    id: 'NEVER',
    weight: 0,
    color: '#fff9f2',
    nameKey: 'level.NEVER.name',
    descriptionKey: 'level.NEVER.description',
  },
];

export const DEFAULT_LEVEL_ID: LevelId = 'NEVER';

export function isLevelId(value: unknown): value is LevelId {
  return typeof value === 'string' && (ALL_LEVEL_IDS as readonly string[]).includes(value);
}

export function getLevelById(id: LevelId): LevelDefinition {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}
