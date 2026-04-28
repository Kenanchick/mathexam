"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const saveReviewSchema = z.object({
  submissionId: z.string().min(1),
  taskScores: z.array(
    z.object({
      homeworkTaskId: z.string().min(1),
      score: z.number().min(0),
      comment: z.string(),
    }),
  ),
  overallComment: z.string(),
  submit: z.boolean(),
});

function getAttemptResult(score: number, maxPoints: number): "CORRECT" | "PARTIAL" | "WRONG" {
  if (score <= 0) return "WRONG";
  if (score >= maxPoints) return "CORRECT";
  return "PARTIAL";
}

export async function saveReview(input: unknown) {
  let teacher;
  try {
    teacher = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const parsed = saveReviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
    };
  }

  const { submissionId, taskScores, overallComment, submit } = parsed.data;

  const recipient = await prisma.homeworkRecipient.findUnique({
    where: { id: submissionId },
    select: { id: true, homework: { select: { id: true, teacherId: true } } },
  });

  if (!recipient || recipient.homework.teacherId !== teacher.id) {
    return { success: false as const, error: "Работа не найдена" };
  }

  const homeworkId = recipient.homework.id;

  const homeworkTaskIds = taskScores.map((ts) => ts.homeworkTaskId);
  const homeworkTasks = await prisma.homeworkTask.findMany({
    where: { id: { in: homeworkTaskIds } },
    select: { id: true, points: true },
  });
  const pointsMap = new Map(homeworkTasks.map((ht) => [ht.id, ht.points]));

  await Promise.all(
    taskScores.map(({ homeworkTaskId, score, comment }) => {
      const maxPoints = pointsMap.get(homeworkTaskId) ?? 1;
      const result = getAttemptResult(score, maxPoints);
      return prisma.homeworkAnswer.upsert({
        where: {
          homeworkRecipientId_homeworkTaskId_attemptNo: {
            homeworkRecipientId: submissionId,
            homeworkTaskId,
            attemptNo: 1,
          },
        },
        create: {
          homeworkRecipientId: submissionId,
          homeworkTaskId,
          attemptNo: 1,
          score,
          teacherComment: comment || null,
          result,
          checkedById: teacher.id,
          checkedAt: new Date(),
        },
        update: {
          score,
          teacherComment: comment || null,
          result,
          checkedById: teacher.id,
          checkedAt: new Date(),
        },
      });
    }),
  );

  if (submit) {
    const allAnswers = await prisma.homeworkAnswer.findMany({
      where: { homeworkRecipientId: submissionId },
      select: { score: true, homeworkTask: { select: { points: true } } },
    });

    const totalEarned = allAnswers.reduce((sum, a) => sum + (a.score ?? 0), 0);
    const totalMax = allAnswers.reduce((sum, a) => sum + a.homeworkTask.points, 0);
    const scorePercent = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

    await prisma.homeworkRecipient.update({
      where: { id: submissionId },
      data: {
        status: "CHECKED",
        teacherComment: overallComment || null,
        scorePercent,
        checkedAt: new Date(),
      },
    });
  } else {
    await prisma.homeworkRecipient.update({
      where: { id: submissionId },
      data: { teacherComment: overallComment || null },
    });
  }

  revalidatePath(`/dashboard/teacher/review/${submissionId}`);
  revalidatePath(`/dashboard/teacher/homework/${homeworkId}`);
  revalidatePath("/dashboard/teacher/homework");
  revalidatePath("/dashboard/teacher/reviews");
  revalidatePath("/dashboard/teacher");

  return { success: true as const };
}
