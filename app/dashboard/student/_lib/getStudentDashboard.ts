import "server-only";

import { prisma } from "@/lib/prisma";

export type StudentDashboardView = {
  studentName: string;
  stats: {
    kind: "solved" | "accuracy" | "streak" | "goal";
    title: string;
    value: string;
    subtitle: string;
  }[];
  currentTraining: {
    taskId: string;
    title: string;
    topic: string;
    progressText: string;
    progressPercent: number;
  } | null;
  homework: {
    id: string;
    title: string;
    teacherName: string;
    deadline: string;
    status: string;
  }[];
  progressChart: {
    date: string;
    percent: number;
  }[];
  recommendedTopics: {
    id: string;
    title: string;
    description: string;
    percent: number;
  }[];
};

function formatDate(date: Date | null) {
  if (!date) return "Без срока";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getLastNDays(days: number) {
  const today = getStartOfDay();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return date;
  });
}

function getCurrentStreak(
  activities: {
    date: Date;
    solvedCount: number;
    correctCount: number;
    wrongCount: number;
  }[],
) {
  const activeDays = new Set(
    activities
      .filter(
        (activity) =>
          activity.solvedCount > 0 ||
          activity.correctCount > 0 ||
          activity.wrongCount > 0,
      )
      .map((activity) => getDateKey(activity.date)),
  );

  let streak = 0;
  const currentDate = getStartOfDay();

  while (true) {
    const key = getDateKey(currentDate);

    if (!activeDays.has(key)) {
      break;
    }

    streak += 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

function getHomeworkStatusLabel(status: string) {
  if (status === "ASSIGNED") return "Новое";
  if (status === "IN_PROGRESS") return "В процессе";
  if (status === "SUBMITTED") return "Сдано";
  if (status === "CHECKING") return "На проверке";
  if (status === "CHECKED") return "Проверено";
  if (status === "RETURNED") return "Возвращено";
  if (status === "OVERDUE") return "Просрочено";

  return status;
}

export async function getStudentDashboard(
  studentId: string,
): Promise<StudentDashboardView> {
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
    },
    select: {
      name: true,
      studentProfile: {
        select: {
          dailyGoalTasks: true,
          targetScore: true,
        },
      },
    },
  });

  const [
    correctTaskAttempts,
    correctAttemptsCount,
    wrongAttemptsCount,
    totalPublishedTasks,
    recentActivities,
    todayActivity,
    topicProgress,
    homeworkRecipients,
  ] = await Promise.all([
    prisma.taskAttempt.findMany({
      where: {
        studentId,
        result: "CORRECT",
      },
      distinct: ["taskId"],
      select: {
        taskId: true,
      },
    }),

    prisma.taskAttempt.count({
      where: {
        studentId,
        result: "CORRECT",
      },
    }),

    prisma.taskAttempt.count({
      where: {
        studentId,
        result: "WRONG",
      },
    }),

    prisma.task.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.studentDailyActivity.findMany({
      where: {
        studentId,
        date: {
          gte: (() => {
            const date = getStartOfDay();
            date.setDate(date.getDate() - 60);
            return date;
          })(),
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        date: true,
        solvedCount: true,
        correctCount: true,
        wrongCount: true,
      },
    }),

    prisma.studentDailyActivity.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: getStartOfDay(),
        },
      },
      select: {
        solvedCount: true,
        correctCount: true,
        wrongCount: true,
        minutesSpent: true,
      },
    }),

    prisma.studentTopicProgress.findMany({
      where: {
        studentId,
      },
      orderBy: [
        {
          masteryPercent: "asc",
        },
        {
          accuracyPercent: "asc",
        },
      ],
      take: 3,
      select: {
        id: true,
        masteryPercent: true,
        accuracyPercent: true,
        solvedCount: true,
        topic: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    }),

    prisma.homeworkRecipient.findMany({
      where: {
        studentId,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "CHECKING", "CHECKED"],
        },
      },
      orderBy: {
        homework: {
          deadline: "asc",
        },
      },
      take: 3,
      select: {
        id: true,
        status: true,
        homework: {
          select: {
            title: true,
            deadline: true,
            teacher: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const solvedTasksCount = correctTaskAttempts.length;

  const checkedAttemptsCount = correctAttemptsCount + wrongAttemptsCount;

  const accuracyPercent =
    checkedAttemptsCount > 0
      ? Math.round((correctAttemptsCount / checkedAttemptsCount) * 100)
      : 0;

  const streakDays = getCurrentStreak(recentActivities);

  const dailyGoal = student?.studentProfile?.dailyGoalTasks ?? 10;
  const todaySolved = todayActivity?.solvedCount ?? 0;
  const remainingToday = Math.max(dailyGoal - todaySolved, 0);

  const solvedTaskIds = correctTaskAttempts.map((attempt) => attempt.taskId);

  const currentTrainingTask = await prisma.task.findFirst({
    where: {
      status: "PUBLISHED",
      id: {
        notIn: solvedTaskIds.length > 0 ? solvedTaskIds : undefined,
      },
    },
    orderBy: [
      {
        examNumber: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      title: true,
      examNumber: true,
      topic: {
        select: {
          title: true,
        },
      },
    },
  });

  const last8Days = getLastNDays(8);

  const activityByDate = new Map(
    recentActivities.map((activity) => [getDateKey(activity.date), activity]),
  );

  const progressChart = last8Days.map((date) => {
    const activity = activityByDate.get(getDateKey(date));

    const correct = activity?.correctCount ?? 0;
    const wrong = activity?.wrongCount ?? 0;
    const total = correct + wrong;

    return {
      date: new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  return {
    studentName: student?.name ?? "Ученик",

    stats: [
      {
        kind: "solved",
        title: "Решено задач",
        value: String(solvedTasksCount),
        subtitle: `Из ${totalPublishedTasks} задач в каталоге`,
      },
      {
        kind: "accuracy",
        title: "Верных ответов",
        value: `${accuracyPercent}%`,
        subtitle: `${correctAttemptsCount} верных из ${checkedAttemptsCount}`,
      },
      {
        kind: "streak",
        title: "Серия занятий",
        value: `${streakDays} дней`,
        subtitle:
          streakDays > 0
            ? "Продолжайте в том же духе"
            : "Начните серию сегодня",
      },
      {
        kind: "goal",
        title: "До цели",
        value: `${remainingToday} задач`,
        subtitle: `Из ${dailyGoal} задач на сегодня`,
      },
    ],

    currentTraining: currentTrainingTask
      ? {
          taskId: currentTrainingTask.id,
          title:
            currentTrainingTask.title ??
            `Задание ${currentTrainingTask.examNumber}`,
          topic: currentTrainingTask.topic.title,
          progressText: `${solvedTasksCount} из ${totalPublishedTasks} задач`,
          progressPercent:
            totalPublishedTasks > 0
              ? Math.round((solvedTasksCount / totalPublishedTasks) * 100)
              : 0,
        }
      : null,

    homework: homeworkRecipients.map((recipient) => ({
      id: recipient.id,
      title: recipient.homework.title,
      teacherName: recipient.homework.teacher.name ?? "Учитель",
      deadline: formatDate(recipient.homework.deadline),
      status: getHomeworkStatusLabel(recipient.status),
    })),

    progressChart,

    recommendedTopics: topicProgress.map((progress) => ({
      id: progress.id,
      title: progress.topic.title,
      description:
        progress.topic.description ??
        `Точность: ${Math.round(progress.accuracyPercent)}%`,
      percent: Math.round(progress.masteryPercent),
    })),
  };
}
