import type { LevelId, RegionLevelState } from './types';
import { LEVELS } from '../config/levels';

export interface ScoreSummary {
totalScore: number;
maxScore: number;
completionRatio: number;
perLevelCounts: Record<LevelId, number>;
}

const weightById: Record<LevelId, number> = LEVELS.reduce(
(acc, level) => {
acc[level.id] = level.weight;
return acc;
},
{} as Record<LevelId, number>
);

export function computeScore(state: RegionLevelState): ScoreSummary {
const perLevelCounts: Record<LevelId, number> = {
LIVED: 0,
SHORT_STAY: 0,
TRAVELED: 0,
BUSINESS_TRIP: 0,
TRANSIT: 0,
NEVER: 0
};

let totalScore = 0;
let regionCount = 0;

for (const [, levelId] of Object.entries(state)) {
const weight = weightById[levelId] ?? 0;
totalScore += weight;
perLevelCounts[levelId] += 1;
regionCount += 1;
}

const maxSingle = LEVELS.reduce((max, l) => Math.max(max, l.weight), 0);
const maxScore = regionCount * maxSingle;
const completionRatio = maxScore > 0 ? totalScore / maxScore : 0;

return {
totalScore,
maxScore,
completionRatio,
perLevelCounts
};
}
