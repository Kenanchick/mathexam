import { prisma } from "@/lib/prisma";
import type {
  AttemptResult,
  TaskDifficulty,
} from "@/lib/generated/prisma/enums";

export type CatalogTaskProgressStatus = "solved" | "unsolved" | "error";

export type CatalogTaskView = {
  id: string;
  number: number;
  title: string;
  topic: string;
  topicSlug: string;
  difficulty: TaskDifficulty;
  difficultyLabel: string;
  condition: string;
  status: CatalogTaskProgressStatus;
  attempts: number;
};

export type CatalogWeakTopicView = {
  title: string;
  solved: number;
  total: number;
  percent: number;
};

export type TasksCatalogView = {
  tasks: CatalogTaskView[];
  filters: {
    numbers: number[];
    topics: string[];
  };
  progress: {
    total: number;
    solved: number;
    unsolved: number;
    withErrors: number;
    percent: number;
    weakTopics: CatalogWeakTopicView[];
  };
};

function getDifficultyLabel(difficulty: TaskDifficulty) {
  if (difficulty === "EASY") return "Легкая";
  if (difficulty === "MEDIUM") return "Средняя";
  return "Сложная";
}

function getTaskProgressStatus(
  attempts: {
    result: AttemptResult;
    isCorrect: boolean;
  }[],
): CatalogTaskProgressStatus {
  const hasCorrectAttempt = attempts.some(
    (attempt) => attempt.result === "CORRECT" || attempt.isCorrect,
  );

  if (hasCorrectAttempt) {
    return "solved";
  }

  if (attempts.length > 0) {
    return "error";
  }

  return "unsolved";
}

export async function getTasksCatalog(
  studentId: string,
): Promise<TasksCatalogView> {
  const tasksFromDb = await prisma.task.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [
      {
        examNumber: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      examNumber: true,
      title: true,
      condition: true,
      difficulty: true,
      topic: {
        select: {
          title: true,
          slug: true,
        },
      },
      attempts: {
        where: {
          studentId,
        },
        select: {
          id: true,
          result: true,
          isCorrect: true,
        },
      },
    },
  });

  const tasks: CatalogTaskView[] = tasksFromDb.map((task) => {
    const progressStatus = getTaskProgressStatus(task.attempts);

    return {
      id: task.id,
      number: task.examNumber,
      title: task.title ?? `Задание ${task.examNumber}`,
      topic: task.topic.title,
      topicSlug: task.topic.slug,
      difficulty: task.difficulty,
      difficultyLabel: getDifficultyLabel(task.difficulty),
      condition: task.condition,
      status: progressStatus,
      attempts: task.attempts.length,
    };
  });

  const total = tasks.length;
  const solved = tasks.filter((task) => task.status === "solved").length;
  const withErrors = tasks.filter((task) => task.status === "error").length;
  const unsolved = total - solved - withErrors;

  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  const numbers = Array.from(new Set(tasks.map((task) => task.number))).sort(
    (a, b) => a - b,
  );

  const topics = Array.from(new Set(tasks.map((task) => task.topic))).sort(
    (a, b) => a.localeCompare(b, "ru"),
  );

  const topicMap = new Map<
    string,
    {
      title: string;
      solved: number;
      total: number;
    }
  >();

  for (const task of tasks) {
    const current = topicMap.get(task.topic) ?? {
      title: task.topic,
      solved: 0,
      total: 0,
    };

    current.total += 1;

    if (task.status === "solved") {
      current.solved += 1;
    }

    topicMap.set(task.topic, current);
  }

  const weakTopics = Array.from(topicMap.values())
    .map((topic) => ({
      title: topic.title,
      solved: topic.solved,
      total: topic.total,
      percent:
        topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0,
    }))
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);

  return {
    tasks,
    filters: {
      numbers,
      topics,
    },
    progress: {
      total,
      solved,
      unsolved,
      withErrors,
      percent,
      weakTopics,
    },
  };
}
