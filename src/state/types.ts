export const ALL_LEVEL_IDS = [
'LIVED',
'SHORT_STAY',
'TRAVELED',
'BUSINESS_TRIP',
'TRANSIT',
'NEVER'
] as const;

export type LevelId = (typeof ALL_LEVEL_IDS)[number];

export interface LevelDefinition {
id: LevelId;
weight: number;
color: string;
nameKey: string;
descriptionKey: string;
}

export interface Region {
id: string;
shortLabel: string;
fullNameEn: string;
fullNameRu: string;
row: number;
col: number;
}

export type RegionLevelState = Record<string, LevelId>;
