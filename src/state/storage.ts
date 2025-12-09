import type { LevelId, Region, RegionLevelState } from './types';
import { ALL_LEVEL_IDS } from './types';
import { DEFAULT_LEVEL_ID } from '../config/levels';

const STORAGE_KEY = 'russia-ex-levels-v1';

export type SerializedState = Record<string, LevelId>;

function isKnownLevel(level: unknown): level is LevelId {
return typeof level === 'string' && (ALL_LEVEL_IDS as readonly string[]).includes(level);
}

export function createDefaultState(regions: Region[]): RegionLevelState {
const result: RegionLevelState = {};
for (const region of regions) {
result[region.id] = DEFAULT_LEVEL_ID;
}
return result;
}

export function serializeState(state: RegionLevelState): SerializedState {
const out: SerializedState = {};
for (const [regionId, levelId] of Object.entries(state)) {
if (isKnownLevel(levelId)) {
out[regionId] = levelId;
}
}
return out;
}

export function deserializeState(data: unknown, regions: Region[]): RegionLevelState {
const base = createDefaultState(regions);
if (!data || typeof data !== 'object') return base;

const raw = data as Record<string, unknown>;
for (const region of regions) {
const value = raw[region.id];
if (isKnownLevel(value)) {
base[region.id] = value;
}
}
return base;
}

export function loadRegionLevels(regions: Region[]): RegionLevelState {
const defaults = createDefaultState(regions);
if (typeof window === 'undefined' || !('localStorage' in window)) {
return defaults;
}

try {
const raw = window.localStorage.getItem(STORAGE_KEY);
if (!raw) return defaults;
const parsed = JSON.parse(raw) as unknown;
return deserializeState(parsed, regions);
} catch {
return defaults;
}
}

export function saveRegionLevels(state: RegionLevelState): void {
if (typeof window === 'undefined' || !('localStorage' in window)) return;
try {
const serialized = serializeState(state);
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
} catch {
}
}

export function clearRegionLevels(): void {
if (typeof window === 'undefined' || !('localStorage' in window)) return;
try {
window.localStorage.removeItem(STORAGE_KEY);
} catch {
}
}
