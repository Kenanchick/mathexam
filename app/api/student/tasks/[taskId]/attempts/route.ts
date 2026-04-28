import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonRequest } from "@/lib/api/parse-json-request";
import {
  authErrorResponse,
  isAuthError,
  requireRole,
} from "@/lib/auth/server";

const checkAnswerSchema = z.object({
  answer: z.string().trim().min(1, "Введите ответ"),
});

function normalizeTextAnswer(answer: string) {
  return answer
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*=\s*/g, "=");
}

function normalizeNumericAnswer(answer: string) {
  return answer.trim().replace(",", ".").replace(/\s+/g, "");
}

function isNumericEqual(userAnswer: string, correctAnswer: string) {
  const userNumber = Number(normalizeNumericAnswer(userAnswer));
  const correctNumber = Number(normalizeNumericAnswer(correctAnswer));

  if (Number.isNaN(userNumber) || Number.isNaN(correctNumber)) {
    return false;
  }

  return Math.abs(userNumber - correctNumber) < 1e-9;
}

function checkAnswer({
  userAnswer,
  correctAnswer,
  acceptedAnswers,
  answerType,
}: {
  userAnswer: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  answerType: "SHORT" | "NUMERIC" | "TEXT";
}) {
  const allCorrectAnswers = [correctAnswer, ...acceptedAnswers];

  if (answerType === "NUMERIC") {
    return allCorrectAnswers.some((answer) => {
      if (isNumericEqual(userAnswer, answer)) {
        return true;
      }

      return normalizeTextAnswer(userAnswer) === normalizeTextAnswer(answer);
    });
  }

  const normalizedUserAnswer = normalizeTextAnswer(userAnswer);

  return allCorrectAnswers.some(
    (answer) => normalizeTextAnswer(answer) === normalizedUserAnswer,
  );
}

function getTodayRange() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return {
    startOfDay,
    endOfDay,
  };
}

async function updateStudentTopicProgress({
  tx,
  studentId,
  topicId,
}: {
  tx: Prisma.TransactionClient;
  studentId: string;
  topicId: string;
}) {
  const attempts = await tx.taskAttempt.findMany({
    where: {
      studentId,
      task: {
        topicId,
      },
      result: {
        in: ["CORRECT", "WRONG"],
      },
    },
    select: {
      taskId: true,
      result: true,
      isCorrect: true,
      timeSpentSec: true,
      submittedAt: true,
    },
  });

  const correctAttempts = attempts.filter(
    (attempt) => attempt.result === "CORRECT" || attempt.isCorrect,
  );

  const wrongAttempts = attempts.filter(
    (attempt) => attempt.result === "WRONG" && !attempt.isCorrect,
  );

  const solvedTaskIds = new Set(
    correctAttempts.map((attempt) => attempt.taskId),
  );

  const checkedAttemptsCount = correctAttempts.length + wrongAttempts.length;

  const accuracyPercent =
    checkedAttemptsCount > 0
      ? Math.round((correctAttempts.length / checkedAttemptsCount) * 100)
      : 0;

  const totalPublishedTasksInTopic = await tx.task.count({
    where: {
      topicId,
      status: "PUBLISHED",
    },
  });

  const masteryPercent =
    totalPublishedTasksInTopic > 0
      ? Math.round((solvedTaskIds.size / totalPublishedTasksInTopic) * 100)
      : 0;

  const attemptsWithTime = attempts.filter(
    (attempt) => typeof attempt.timeSpentSec === "number",
  );

  const averageTimeSec =
    attemptsWithTime.length > 0
      ? Math.round(
          attemptsWithTime.reduce(
            (sum, attempt) => sum + (attempt.timeSpentSec ?? 0),
            0,
          ) / attemptsWithTime.length,
        )
      : null;

  const lastSolvedAt =
    correctAttempts.length > 0
      ? correctAttempts
          .map((attempt) => attempt.submittedAt)
          .sort((a, b) => b.getTime() - a.getTime())[0]
      : null;

  await tx.studentTopicProgress.upsert({
    where: {
      studentId_topicId: {
        studentId,
        topicId,
      },
    },
    update: {
      solvedCount: solvedTaskIds.size,
      correctCount: correctAttempts.length,
      wrongCount: wrongAttempts.length,
      accuracyPercent,
      masteryPercent,
      averageTimeSec,
      lastSolvedAt,
    },
    create: {
      studentId,
      topicId,
      solvedCount: solvedTaskIds.size,
      correctCount: correctAttempts.length,
      wrongCount: wrongAttempts.length,
      accuracyPercent,
      masteryPercent,
      averageTimeSec,
      lastSolvedAt,
    },
  });
}

async function updateStudentDailyActivity({
  tx,
  studentId,
}: {
  tx: Prisma.TransactionClient;
  studentId: string;
}) {
  const { startOfDay, endOfDay } = getTodayRange();

  const todayAttempts = await tx.taskAttempt.findMany({
    where: {
      studentId,
      submittedAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
      result: {
        in: ["CORRECT", "WRONG"],
      },
    },
    select: {
      taskId: true,
      result: true,
      isCorrect: true,
      timeSpentSec: true,
    },
  });

  const correctAttempts = todayAttempts.filter(
    (attempt) => attempt.result === "CORRECT" || attempt.isCorrect,
  );

  const wrongAttempts = todayAttempts.filter(
    (attempt) => attempt.result === "WRONG" && !attempt.isCorrect,
  );

  const solvedTaskIds = new Set(
    correctAttempts.map((attempt) => attempt.taskId),
  );

  const minutesSpent = Math.round(
    todayAttempts.reduce(
      (sum, attempt) => sum + (attempt.timeSpentSec ?? 0),
      0,
    ) / 60,
  );

  await tx.studentDailyActivity.upsert({
    where: {
      studentId_date: {
        studentId,
        date: startOfDay,
      },
    },
    update: {
      solvedCount: solvedTaskIds.size,
      correctCount: correctAttempts.length,
      wrongCount: wrongAttempts.length,
      minutesSpent,
    },
    create: {
      studentId,
      date: startOfDay,
      solvedCount: solvedTaskIds.size,
      correctCount: correctAttempts.length,
      wrongCount: wrongAttempts.length,
      minutesSpent,
    },
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    const user = await requireRole("STUDENT");

    const body = await parseJsonRequest(req);

    if (!body.success) {
      return body.response;
    }

    const parsed = checkAnswerSchema.safeParse(body.data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Некорректные данные",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { answer } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findFirst({
        where: {
          id: taskId,
          status: "PUBLISHED",
        },
        select: {
          id: true,
          topicId: true,
          correctAnswer: true,
          acceptedAnswers: true,
          answerType: true,
        },
      });

      if (!task) {
        return {
          type: "TASK_NOT_FOUND" as const,
        };
      }

      const isCorrect = checkAnswer({
        userAnswer: answer,
        correctAnswer: task.correctAnswer,
        acceptedAnswers: task.acceptedAnswers,
        answerType: task.answerType,
      });

      const attempt = await tx.taskAttempt.create({
        data: {
          studentId: user.id,
          taskId: task.id,
          answer,
          normalizedAnswer: normalizeTextAnswer(answer),
          result: isCorrect ? "CORRECT" : "WRONG",
          isCorrect,
          submittedAt: new Date(),
        },
        select: {
          id: true,
          result: true,
          isCorrect: true,
          answer: true,
          submittedAt: true,
        },
      });

      await updateStudentTopicProgress({
        tx,
        studentId: user.id,
        topicId: task.topicId,
      });

      await updateStudentDailyActivity({
        tx,
        studentId: user.id,
      });

      return {
        type: "SUCCESS" as const,
        attempt,
      };
    });

    if (result.type === "TASK_NOT_FOUND") {
      return NextResponse.json(
        { message: "Задача не найдена" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: result.attempt.isCorrect ? "Ответ верный" : "Ответ неверный",
        attempt: result.attempt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (isAuthError(error)) {
      return authErrorResponse(error);
    }

    console.error("CHECK_TASK_ANSWER_ERROR:", error);

    return NextResponse.json(
      { message: "Ошибка сервера при проверке ответа" },
      { status: 500 },
    );
  }
}
