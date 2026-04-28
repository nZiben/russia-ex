import { describe, it, expect } from 'vitest';
import { createDefaultState, serializeState, deserializeState } from '../src/state/storage';
import type { Region, RegionLevelState } from '../src/state/types';

const mockRegions: Region[] = [
  {
    id: 'moscow_city',
    shortLabel: 'Msc',
    fullNameEn: 'Moscow',
    fullNameRu: 'Москва',
    row: 1,
    col: 1,
    districtId: 'central',
  },
  {
    id: 'tatarstan_republic',
    shortLabel: 'Tat',
    fullNameEn: 'Republic of Tatarstan',
    fullNameRu: 'Республика Татарстан',
    row: 1,
    col: 2,
    districtId: 'volga',
  },
];

describe('storage serialization', () => {
  it('creates default state with NEVER', () => {
    const state = createDefaultState(mockRegions);
    expect(state.moscow_city).toBe('NEVER');
    expect(state.tatarstan_republic).toBe('NEVER');
  });

  it('serializes and deserializes round-trip', () => {
    const state: RegionLevelState = {
      moscow_city: 'LIVED',
      tatarstan_republic: 'TRANSIT',
      some_unknown_region: 'LIVED',
    } as RegionLevelState;

    const serialized = serializeState(state);
    expect(serialized.some_unknown_region).toBe('LIVED');

    const restored = deserializeState(serialized, mockRegions);
    expect(restored.moscow_city).toBe('LIVED');
    expect(restored.tatarstan_republic).toBe('TRANSIT');
    expect(restored).not.toHaveProperty('some_unknown_region');
  });

  it('falls back to defaults for invalid data', () => {
    const invalid = {
      moscow_city: 'UNKNOWN',
      tatarstan_republic: 42,
    };

    const restored = deserializeState(invalid, mockRegions);
    expect(restored.moscow_city).toBe('NEVER');
    expect(restored.tatarstan_republic).toBe('NEVER');
  });
});
