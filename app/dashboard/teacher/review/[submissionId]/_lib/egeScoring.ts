export const TASK_MAX_SCORES: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
  7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1,
  13: 2, 14: 3, 15: 2, 16: 2, 17: 3, 18: 4, 19: 4,
};

const EGE_PRIMARY_TO_TEST: Record<number, number> = {
  0: 0, 1: 6, 2: 11, 3: 17, 4: 22, 5: 27, 6: 34,
  7: 40, 8: 46, 9: 52, 10: 58, 11: 64, 12: 70,
  13: 72, 14: 74, 15: 76, 16: 78, 17: 80, 18: 82,
  19: 84, 20: 86, 21: 88, 22: 90, 23: 92, 24: 94,
  25: 95, 26: 96, 27: 97, 28: 98, 29: 99,
  30: 100, 31: 100, 32: 100,
};

export function getTaskMaxScore(examNumber: number): number {
  return TASK_MAX_SCORES[examNumber] ?? 1;
}

export function convertPrimaryToTestScore(primaryScore: number): number {
  const clamped = Math.min(32, Math.max(0, Math.round(primaryScore)));
  return EGE_PRIMARY_TO_TEST[clamped] ?? 0;
}

export function getMaxPrimaryScore(examNumbers: number[]): number {
  return examNumbers.reduce((sum, n) => sum + getTaskMaxScore(n), 0);
}

export const EGE_TOTAL_MAX_PRIMARY = 32;
