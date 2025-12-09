import { describe, it, expect } from 'vitest';
import { LEVELS } from '../src/config/levels';
import { ALL_LEVEL_IDS } from '../src/state/types';

describe('levels config', () => {
it('has unique IDs matching ALL_LEVEL_IDS', () => {
const ids = LEVELS.map((l) => l.id);
const unique = new Set(ids);
expect(unique.size).toBe(ids.length);

arduino
Copy code
const expected = new Set(ALL_LEVEL_IDS);
expect(unique.size).toBe(expected.size);

for (const id of ALL_LEVEL_IDS) {
  expect(unique.has(id)).toBe(true);
}
});

it('has numeric weights for all levels', () => {
for (const level of LEVELS) {
expect(typeof level.weight).toBe('number');
expect(level.weight).toBeGreaterThanOrEqual(0);
}
});
});
