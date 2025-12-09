import { describe, it, expect } from 'vitest';
import { computeScore } from '../src/state/scoring';
import type { RegionLevelState } from '../src/state/types';
import { LEVELS } from '../src/config/levels';

describe('scoring', () => {
it('computes score and per-level counts', () => {
const state: RegionLevelState = {
moscow_city: 'LIVED',
saint_petersburg: 'TRAVELED',
tatarstan_republic: 'NEVER'
};

javascript
Copy code
const summary = computeScore(state);

const livedWeight = LEVELS.find((l) => l.id === 'LIVED')!.weight;
const traveledWeight = LEVELS.find((l) => l.id === 'TRAVELED')!.weight;

expect(summary.totalScore).toBe(livedWeight + traveledWeight);
expect(summary.perLevelCounts.LIVED).toBe(1);
expect(summary.perLevelCounts.TRAVELED).toBe(1);
expect(summary.perLevelCounts.NEVER).toBe(1);

const maxWeight = Math.max(...LEVELS.map((l) => l.weight));
expect(summary.maxScore).toBe(Object.keys(state).length * maxWeight);
});
});
