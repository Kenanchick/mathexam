import "server-only";

import { prisma } from "@/lib/prisma";

export type HomeworkStatus = "new" | "in_progress" | "submitted" | "overdue";
export type HomeworkTab = HomeworkStatus;

export type HomeworkItemView = {
  id: string;
  title: string;
  teacher: string;
  tasksTotal: number;
  tasksCompleted: number;
  deadline: string;
  deadlineIso: string | null;
  submittedDate: string | null;
  status: HomeworkStatus;
};

export type DeadlineEntry = {
  title: string;
  deadlineIso: string;
};

export type HomeworkPageData = {
  items: HomeworkItemView[];
  stats: { totalActive: number; newCount: number; submittedThisMonth: number };
  deadlines: DeadlineEntry[];
};

type DbStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "CHECKING"
  | "CHECKED"
  | "RETURNED"
  | "OVERDUE";

function formatDay(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(date);
}

function computeStatus(
  dbStatus: DbStatus,
  deadline: Date | null,
  now: Date,
): HomeworkStatus {
  const isActive =
    dbStatus === "ASSIGNED" ||
    dbStatus === "IN_PROGRESS" ||
    dbStatus === "RETURNED";

  if (isActive && deadline && deadline < now) return "overdue";
  if (dbStatus === "OVERDUE") return "overdue";
  if (dbStatus === "ASSIGNED") return "new";
  if (dbStatus === "IN_PROGRESS" || dbStatus === "RETURNED") return "in_progress";
  return "submitted";
}

export async function getHomeworkData(studentId: string): Promise<HomeworkPageData> {
  const now = new Date();

  const recipients = await prisma.homeworkRecipient.findMany({
    where: {
      studentId,
      homework: { status: "PUBLISHED" },
    },
    orderBy: { homework: { deadline: "asc" } },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      homework: {
        select: {
          id: true,
          title: true,
          deadline: true,
          teacher: { select: { name: true } },
          tasks: { select: { id: true } },
        },
      },
      answers: {
        where: {
          OR: [
            { submittedAt: { not: null } },
            { checkedAt: { not: null } },
          ],
        },
        select: { homeworkTaskId: true },
      },
    },
  });

  const items: HomeworkItemView[] = recipients.map((r) => {
    const deadline = r.homework.deadline;
    const status = computeStatus(r.status as DbStatus, deadline, now);
    const tasksTotal = r.homework.tasks.length;
    const answeredIds = new Set(r.answers.map((a) => a.homeworkTaskId));

    return {
      id: r.id,
      title: r.homework.title,
      teacher: r.homework.teacher.name ?? "Преподаватель",
      tasksTotal,
      tasksCompleted: answeredIds.size,
      deadline: deadline ? `до ${formatDay(deadline)}` : "Без дедлайна",
      deadlineIso: deadline?.toISOString() ?? null,
      submittedDate: r.submittedAt ? formatDay(r.submittedAt) : null,
      status,
    };
  });

  const totalActive = items.filter(
    (i) => i.status === "new" || i.status === "in_progress",
  ).length;
  const newCount = items.filter((i) => i.status === "new").length;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const submittedThisMonth = recipients.filter((r) => {
    const s = computeStatus(r.status as DbStatus, r.homework.deadline, now);
    return s === "submitted" && r.submittedAt && r.submittedAt >= startOfMonth;
  }).length;

  const deadlines: DeadlineEntry[] = items
    .filter(
      (i) =>
        i.deadlineIso !== null &&
        (i.status === "new" || i.status === "in_progress"),
    )
    .map((i) => ({ title: i.title, deadlineIso: i.deadlineIso! }));

  return {
    items,
    stats: { totalActive, newCount, submittedThisMonth },
    deadlines,
  };
}
