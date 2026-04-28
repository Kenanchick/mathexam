"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const saveAnswerSchema = z.object({
  recipientId: z.string().min(1),
  homeworkTaskId: z.string().min(1),
  answer: z.string().nullable(),
  fileUrls: z.string().array().default([]),
});

function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function saveAnswer(input: unknown) {
  let student;
  try {
    student = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }
    throw error;
  }

  const parsed = saveAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
    };
  }

  const { recipientId, homeworkTaskId, answer, fileUrls } = parsed.data;
  const fileUrl = fileUrls.length > 0 ? JSON.stringify(fileUrls) : null;

  const recipient = await prisma.homeworkRecipient.findUnique({
    where: { id: recipientId },
    select: { id: true, studentId: true, status: true, homeworkId: true },
  });

  if (!recipient || recipient.studentId !== student.id) {
    return { success: false as const, error: "Задание не найдено" };
  }

  if (!["ASSIGNED", "IN_PROGRESS", "RETURNED"].includes(recipient.status)) {
    return { success: false as const, error: "Нельзя изменить ответ после сдачи" };
  }

  const homeworkTask = await prisma.homeworkTask.findUnique({
    where: { id: homeworkTaskId },
    select: {
      id: true,
      homeworkId: true,
      points: true,
      task: {
        select: {
          id: true,
          examNumber: true,
          correctAnswer: true,
          acceptedAnswers: true,
          topicId: true,
        },
      },
    },
  });

  if (!homeworkTask || homeworkTask.homeworkId !== recipient.homeworkId) {
    return { success: false as const, error: "Задача не найдена" };
  }

  const isPartOne = homeworkTask.task.examNumber <= 12;
  let result: "PENDING" | "CORRECT" | "WRONG" = "PENDING";
  let score: number | null = null;

  if (isPartOne && answer !== null && answer.trim().length > 0) {
    const normalized = normalizeAnswer(answer);
    const correct = normalizeAnswer(homeworkTask.task.correctAnswer);
    const accepted = homeworkTask.task.acceptedAnswers.map(normalizeAnswer);
    const isCorrect = normalized === correct || accepted.includes(normalized);
    result = isCorrect ? "CORRECT" : "WRONG";
    score = isCorrect ? homeworkTask.points : 0;
  }

  await prisma.homeworkAnswer.upsert({
    where: {
      homeworkRecipientId_homeworkTaskId_attemptNo: {
        homeworkRecipientId: recipientId,
        homeworkTaskId,
        attemptNo: 1,
      },
    },
    create: {
      homeworkRecipientId: recipientId,
      homeworkTaskId,
      attemptNo: 1,
      answer: answer || null,
      fileUrl: fileUrl || null,
      result,
      score,
      submittedAt: new Date(),
    },
    update: {
      answer: answer || null,
      fileUrl: fileUrl || null,
      result,
      score,
      submittedAt: new Date(),
    },
  });

  const [allAnswers, totalTasks] = await Promise.all([
    prisma.homeworkAnswer.findMany({
      where: { homeworkRecipientId: recipientId },
      select: { homeworkTaskId: true },
    }),
    prisma.homeworkTask.count({ where: { homeworkId: recipient.homeworkId } }),
  ]);

  const answeredCount = new Set(allAnswers.map((a) => a.homeworkTaskId)).size;
  const progressPercent = totalTasks > 0 ? (answeredCount / totalTasks) * 100 : 0;

  await prisma.homeworkRecipient.update({
    where: { id: recipientId },
    data: {
      progressPercent,
      status: recipient.status === "ASSIGNED" ? "IN_PROGRESS" : undefined,
      startedAt: recipient.status === "ASSIGNED" ? new Date() : undefined,
    },
  });

  if (isPartOne && (result === "CORRECT" || result === "WRONG")) {
    const topicId = homeworkTask.task.topicId;

    const existing = await prisma.studentTopicProgress.findUnique({
      where: { studentId_topicId: { studentId: student.id, topicId } },
      select: { solvedCount: true, correctCount: true, wrongCount: true },
    });

    const newSolved = (existing?.solvedCount ?? 0) + 1;
    const newCorrect = (existing?.correctCount ?? 0) + (result === "CORRECT" ? 1 : 0);
    const newWrong = (existing?.wrongCount ?? 0) + (result === "WRONG" ? 1 : 0);
    const newAccuracy = newSolved > 0 ? (newCorrect / newSolved) * 100 : 0;
    const volumeScore = Math.min((newSolved / 20) * 100, 100);
    const newMastery = Math.min(newAccuracy * 0.6 + volumeScore * 0.4, 100);

    await prisma.studentTopicProgress.upsert({
      where: { studentId_topicId: { studentId: student.id, topicId } },
      create: {
        studentId: student.id,
        topicId,
        solvedCount: newSolved,
        correctCount: newCorrect,
        wrongCount: newWrong,
        accuracyPercent: newAccuracy,
        masteryPercent: newMastery,
        lastSolvedAt: new Date(),
      },
      update: {
        solvedCount: newSolved,
        correctCount: newCorrect,
        wrongCount: newWrong,
        accuracyPercent: newAccuracy,
        masteryPercent: newMastery,
        lastSolvedAt: new Date(),
      },
    });
  }

  revalidatePath(`/dashboard/student/homework/${recipientId}`);
  revalidatePath("/dashboard/student/homework");
  revalidatePath("/dashboard/student");

  return { success: true as const, result, score };
}
