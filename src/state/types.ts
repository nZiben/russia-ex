export type LevelId =
  | 'LIVED'
  | 'SHORT_STAY'
  | 'TRAVELED'
  | 'BUSINESS_TRIP'
  | 'TRANSIT'
  | 'NEVER';

export interface LevelDefinition {
  id: LevelId;
  weight: number;
  color: string;
  nameKey: string;
  descriptionKey: string;
}

export const ALL_LEVEL_IDS: readonly LevelId[] = [
  'LIVED',
  'SHORT_STAY',
  'TRAVELED',
  'BUSINESS_TRIP',
  'TRANSIT',
  'NEVER'
] as const;

export type RegionLevelState = Record<string, LevelId>;

export type DistrictId =
  | 'central'
  | 'northwestern'
  | 'southern'
  | 'north_caucasian'
  | 'volga'
  | 'ural'
  | 'siberian'
  | 'far_eastern';

export interface Region {
  id: string;
  shortLabel: string;
  fullNameEn: string;
  fullNameRu: string;
  row: number;
  col: number;
  districtId: DistrictId;
  /** Optional size in grid cells (default 1x1) */
  width?: number;
  height?: number;
}

export interface District {
  id: DistrictId;
  shortLabel: string;
  fullNameEn: string;
  fullNameRu: string;
  row: number;
  col: number;
  /** Size in grid cells for block-cartogram */
  width?: number;
  height?: number;
}
