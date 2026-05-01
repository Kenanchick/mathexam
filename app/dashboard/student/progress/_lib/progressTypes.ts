export const EXAM_POINTS: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
  7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1,
  13: 2, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4,
};
export const MAX_PRIMARY = 32;

export type ExamStat = {
  examNumber: number;
  attempts: number;
  correct: number;
  accuracyPercent: number;
  earnedPoints: number;
  maxPoints: number;
};

export type DayActivity = {
  date: string;
  solvedCount: number;
  correctCount: number;
};

export type WeakTopic = {
  id: string;
  title: string;
  solvedCount: number;
  correctCount: number;
  accuracyPercent: number;
};

export type ProgressData = {
  totalSolved: number;
  accuracyPercent: number;
  streak: number;
  predictedSecondary: number;
  predictedPrimary: number;
  examStats: ExamStat[];
  dailyActivity: DayActivity[];
  weakTopics: WeakTopic[];
};
