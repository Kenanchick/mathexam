import "server-only";

import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import {
  EXAM_POINTS,
  MAX_PRIMARY,
  type ExamStat,
  type DayActivity,
  type WeakTopic,
  type ProgressData,
} from "./progressTypes";

export type { ExamStat, DayActivity, WeakTopic, ProgressData };
export { EXAM_POINTS, MAX_PRIMARY };

// Official conversion table: index = primary score → secondary score
const PRIMARY_TO_SECONDARY = [
  0, 6, 12, 17, 22, 27, 30, 33, 36, 40, 43, 46, 49,
  52, 55, 58, 61, 64, 66, 68, 70, 72, 74, 76, 78, 80,
  82, 84, 86, 88, 90, 95, 100,
];

function primaryToSecondary(primary: number): number {
  const clamped = Math.max(0, Math.min(MAX_PRIMARY, Math.round(primary)));
  return PRIMARY_TO_SECONDARY[clamped] ?? 0;
}

function getStartOfDay(offset = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (offset) d.setDate(d.getDate() + offset);
  return d;
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calcStreak(activities: { date: Date; solvedCount: number }[]): number {
  const active = new Set(
    activities.filter((a) => a.solvedCount > 0).map((a) => getDateKey(a.date)),
  );
  let streak = 0;
  const cur = getStartOfDay();
  while (active.has(getDateKey(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export async function getProgressData(): Promise<ProgressData> {
  const auth = await requireRole("STUDENT");
  const studentId = auth.id;

  const thirtyDaysAgo = getStartOfDay(-29);

  const [attempts, activities, topicProgress] = await Promise.all([
    prisma.taskAttempt.findMany({
      where: { studentId, result: { not: "PENDING" } },
      select: {
        result: true,
        task: { select: { examNumber: true } },
      },
    }),

    prisma.studentDailyActivity.findMany({
      where: { studentId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: "asc" },
      select: { date: true, solvedCount: true, correctCount: true },
    }),

    prisma.studentTopicProgress.findMany({
      where: {
        studentId,
        solvedCount: { gte: 2 },
        accuracyPercent: { lt: 70 },
      },
      orderBy: { accuracyPercent: "asc" },
      take: 8,
      select: {
        accuracyPercent: true,
        solvedCount: true,
        correctCount: true,
        topic: { select: { id: true, title: true } },
      },
    }),
  ]);

  const correctCount = attempts.filter((a) => a.result === "CORRECT").length;
  const totalCount = attempts.length;
  const accuracyPercent =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const byNumber: Record<number, { total: number; correct: number }> = {};
  for (const a of attempts) {
    const n = a.task.examNumber;
    if (!byNumber[n]) byNumber[n] = { total: 0, correct: 0 };
    byNumber[n].total++;
    if (a.result === "CORRECT") byNumber[n].correct++;
  }

  let totalEarned = 0;
  const examStats: ExamStat[] = Array.from({ length: 19 }, (_, i) => {
    const n = i + 1;
    const data = byNumber[n];
    const maxPoints = EXAM_POINTS[n] ?? 1;
    if (!data) {
      return { examNumber: n, attempts: 0, correct: 0, accuracyPercent: 0, earnedPoints: 0, maxPoints };
    }
    const acc = Math.round((data.correct / data.total) * 100);
    const earned = maxPoints * (acc / 100);
    totalEarned += earned;
    return { examNumber: n, attempts: data.total, correct: data.correct, accuracyPercent: acc, earnedPoints: earned, maxPoints };
  });

  const predictedPrimary = Math.round(totalEarned);
  const predictedSecondary = primaryToSecondary(predictedPrimary);

  const activityMap: Record<string, { solvedCount: number; correctCount: number }> = {};
  for (const a of activities) {
    activityMap[getDateKey(a.date)] = { solvedCount: a.solvedCount, correctCount: a.correctCount };
  }

  const dailyActivity: DayActivity[] = Array.from({ length: 30 }, (_, i) => {
    const d = getStartOfDay(-29 + i);
    const key = getDateKey(d);
    const slot = activityMap[key];
    return { date: key, solvedCount: slot?.solvedCount ?? 0, correctCount: slot?.correctCount ?? 0 };
  });

  const streak = calcStreak(activities);

  const weakTopics: WeakTopic[] = topicProgress.map((tp) => ({
    id: tp.topic.id,
    title: tp.topic.title,
    solvedCount: tp.solvedCount,
    correctCount: tp.correctCount,
    accuracyPercent: Math.round(tp.accuracyPercent),
  }));

  return {
    totalSolved: correctCount,
    accuracyPercent,
    streak,
    predictedSecondary,
    predictedPrimary,
    examStats,
    dailyActivity,
    weakTopics,
  };
}
