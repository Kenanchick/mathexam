import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type {
  AttemptResult,
  TaskDifficulty,
} from "@/lib/generated/prisma/enums";

export type TaskDetailView = {
  id: string;
  number: number;
  title: string;
  topic: string;
  subtopic: string | null;
  difficulty: TaskDifficulty;
  difficultyLabel: string;
  averageTime: string;
  condition: string;
  imageUrls: string[];
  solutionImageUrls: string[];
  attempts: {
    id: string;
    title: string;
    status: string;
    time: string;
    type: "success" | "wrong" | "pending" | "partial";
  }[];
  similarTasks: {
    id: string;
    number: number;
    title: string;
    topic: string;
    difficulty: TaskDifficulty;
    difficultyLabel: string;
    condition: string;
  }[];
};

function getDifficultyLabel(difficulty: TaskDifficulty) {
  if (difficulty === "EASY") return "Легкая";
  if (difficulty === "MEDIUM") return "Средняя";
  return "Сложная";
}

function getAttemptType(
  result: AttemptResult,
): "success" | "wrong" | "pending" | "partial" {
  if (result === "CORRECT") return "success";
  if (result === "WRONG") return "wrong";
  if (result === "PARTIAL") return "partial";
  return "pending";
}

function getAttemptStatus(result: AttemptResult) {
  if (result === "CORRECT") return "Верно";
  if (result === "WRONG") return "Неверно";
  if (result === "PARTIAL") return "Частично";
  return "На проверке";
}

function formatSolveTime(seconds: number | null) {
  if (!seconds) return "—";

  const minutes = Math.max(1, Math.round(seconds / 60));

  return `${minutes} мин`;
}

function formatAttemptTime(seconds: number | null) {
  if (!seconds) return "—";

  const minutes = Math.max(1, Math.round(seconds / 60));

  return `${minutes} мин`;
}

export async function getTaskDetail(taskId: string, studentId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      examNumber: true,
      title: true,
      condition: true,
      imageUrl: true,
      imageUrls: true,
      solutionImageUrls: true,
      difficulty: true,
      solveTimeSec: true,
      topicId: true,
      topic: {
        select: {
          title: true,
        },
      },
      subtopic: {
        select: {
          title: true,
        },
      },
      attempts: {
        where: {
          studentId,
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          result: true,
          timeSpentSec: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const similarTasks = await prisma.task.findMany({
    where: {
      id: {
        not: task.id,
      },
      topicId: task.topicId,
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
    select: {
      id: true,
      examNumber: true,
      title: true,
      condition: true,
      difficulty: true,
      topic: {
        select: {
          title: true,
        },
      },
    },
  });

  const view: TaskDetailView = {
    id: task.id,
    number: task.examNumber,
    title: task.title ?? `Задание ${task.examNumber}`,
    topic: task.topic.title,
    subtopic: task.subtopic?.title ?? null,
    difficulty: task.difficulty,
    difficultyLabel: getDifficultyLabel(task.difficulty),
    averageTime: formatSolveTime(task.solveTimeSec),
    condition: task.condition,
    imageUrls:
      task.imageUrls.length > 0
        ? task.imageUrls
        : task.imageUrl
          ? [task.imageUrl]
          : [],
    solutionImageUrls: task.solutionImageUrls,
    attempts: task.attempts.map((attempt, index) => ({
      id: attempt.id,
      title: `Попытка ${task.attempts.length - index}`,
      status: getAttemptStatus(attempt.result),
      time: formatAttemptTime(attempt.timeSpentSec),
      type: getAttemptType(attempt.result),
    })),
    similarTasks: similarTasks.map((similarTask) => ({
      id: similarTask.id,
      number: similarTask.examNumber,
      title: similarTask.title ?? `Задание ${similarTask.examNumber}`,
      topic: similarTask.topic.title,
      difficulty: similarTask.difficulty,
      difficultyLabel: getDifficultyLabel(similarTask.difficulty),
      condition: similarTask.condition,
    })),
  };

  return view;
}
