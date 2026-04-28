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

export type HomeworkCalendar = {
  monthTitle: string;
  today: number;
  deadlineDays: number[];
  rows: (number | null)[][];
  upcomingDeadlines: { title: string; date: string; color: "yellow" | "blue" }[];
};

export type HomeworkPageData = {
  items: HomeworkItemView[];
  stats: { totalActive: number; newCount: number; submittedThisMonth: number };
  calendar: HomeworkCalendar;
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

function buildCalendarRows(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function buildMonthTitle(year: number, month: number): string {
  const name = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(
    new Date(year, month),
  );
  return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
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
        where: { submittedAt: { not: null } },
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

  // Stats
  const totalActive = items.filter(
    (i) => i.status === "new" || i.status === "in_progress",
  ).length;
  const newCount = items.filter((i) => i.status === "new").length;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const submittedThisMonth = recipients.filter((r) => {
    const s = computeStatus(r.status as DbStatus, r.homework.deadline, now);
    return s === "submitted" && r.submittedAt && r.submittedAt >= startOfMonth;
  }).length;

  // Calendar
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const rows = buildCalendarRows(year, month);
  const monthTitle = buildMonthTitle(year, month);

  const deadlineDays = [
    ...new Set(
      items
        .filter((i) => i.deadlineIso)
        .map((i) => new Date(i.deadlineIso!))
        .filter((d) => d.getFullYear() === year && d.getMonth() === month)
        .map((d) => d.getDate()),
    ),
  ];

  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const upcomingDeadlines = items
    .filter((i) => {
      if (!i.deadlineIso) return false;
      const d = new Date(i.deadlineIso);
      return d > now && d.getTime() - now.getTime() <= fourteenDaysMs;
    })
    .sort((a, b) => new Date(a.deadlineIso!).getTime() - new Date(b.deadlineIso!).getTime())
    .slice(0, 3)
    .map((i, idx) => ({
      title: i.title,
      date: i.deadline.replace(/^до /, ""),
      color: idx === 0 ? ("yellow" as const) : ("blue" as const),
    }));

  return {
    items,
    stats: { totalActive, newCount, submittedThisMonth },
    calendar: { monthTitle, today, deadlineDays, rows, upcomingDeadlines },
  };
}
