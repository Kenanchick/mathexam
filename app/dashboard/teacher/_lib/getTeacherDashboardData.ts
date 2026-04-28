import "server-only";

import { prisma } from "@/lib/prisma";
import { getActivityMessage } from "./activityFormatter";

export type TeacherDashboardStats = {
  activeClassesCount: number;
  totalStudentsCount: number;
  pendingReviewCount: number;
  avgScorePercent: number;
};

export type TeacherDashboardClass = {
  id: string;
  name: string;
  studentCount: number;
  avgProgress: number;
  homeworkCount: number;
  pendingReviews: number;
};

export type ReviewStatus = "pending" | "needs_comment";

export type TeacherDashboardReview = {
  id: string;
  studentName: string;
  homeworkTitle: string;
  submittedAt: string;
  status: ReviewStatus;
};

export type ActivityBadge = "submitted" | "reviewing" | "overdue" | "progress";

export type TeacherDashboardActivity = {
  id: string;
  avatarText: string;
  text: string;
  time: string;
  badge?: ActivityBadge;
};

export type TeacherDeadlineItem = {
  id: string;
  title: string;
  classroomName: string | null;
  deadline: Date;
  submittedCount: number;
  totalCount: number;
};

export type TeacherDashboardData = {
  teacherName: string;
  stats: TeacherDashboardStats;
  classes: TeacherDashboardClass[];
  reviews: TeacherDashboardReview[];
  activityEvents: TeacherDashboardActivity[];
  upcomingDeadlines: TeacherDeadlineItem[];
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHours < 24) {
    const timeStr = date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Сегодня, ${timeStr}`;
  }
  if (diffHours < 48) {
    const timeStr = date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Вчера, ${timeStr}`;
  }
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatSubmittedAt(date: Date | null | undefined): string {
  if (!date) return "—";
  return formatRelativeTime(date);
}

function badgeFromType(type: string): ActivityBadge | undefined {
  switch (type) {
    case "HOMEWORK_SUBMITTED":
      return "submitted";
    case "HOMEWORK_CHECKING":
      return "reviewing";
    case "HOMEWORK_CHECKED":
      return "progress";
    case "HOMEWORK_RETURNED":
      return "reviewing";
    case "HOMEWORK_OVERDUE":
      return "overdue";
    default:
      return undefined;
  }
}

function getAvatarText(
  studentName?: string | null,
  classroomTitle?: string | null,
): string {
  if (studentName) {
    const parts = studentName.trim().split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0]! + parts[1][0]!).toUpperCase();
    }
    return studentName.slice(0, 2).toUpperCase();
  }
  if (classroomTitle) return classroomTitle.slice(0, 3);
  return "??";
}

export async function getTeacherDashboardData(
  teacherId: string,
): Promise<TeacherDashboardData> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    teacher,
    classrooms,
    pendingReviewCount,
    avgScoreResult,
    reviews,
    activityLogs,
    deadlineHomeworks,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: teacherId },
      select: { name: true },
    }),

    prisma.classroom.findMany({
      where: { teacherId, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            students: { where: { status: "ACTIVE" } },
          },
        },
        homeworks: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            recipients: {
              select: {
                status: true,
                progressPercent: true,
              },
            },
          },
        },
      },
    }),

    prisma.homeworkRecipient.count({
      where: {
        homework: { teacherId },
        status: { in: ["SUBMITTED", "CHECKING"] },
      },
    }),

    prisma.homeworkRecipient.aggregate({
      where: {
        homework: { teacherId },
        status: { in: ["CHECKED", "RETURNED"] },
        scorePercent: { not: null },
      },
      _avg: { scorePercent: true },
    }),

    prisma.homeworkRecipient.findMany({
      where: {
        homework: { teacherId },
        status: { in: ["SUBMITTED", "CHECKING"] },
      },
      orderBy: { submittedAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        student: { select: { name: true } },
        homework: { select: { title: true } },
      },
    }),

    prisma.activityLog.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        createdAt: true,
        student: { select: { name: true } },
        homework: { select: { title: true } },
        classroom: { select: { title: true } },
      },
    }),

    prisma.homework.findMany({
      where: {
        teacherId,
        status: "PUBLISHED",
        deadline: { gte: todayStart },
      },
      orderBy: { deadline: "asc" },
      take: 4,
      select: {
        id: true,
        title: true,
        deadline: true,
        classroom: { select: { title: true } },
        recipients: { select: { status: true } },
      },
    }),
  ]);

  const sumStudents = classrooms.reduce((sum, c) => sum + c._count.students, 0);

  const mappedClasses: TeacherDashboardClass[] = classrooms.map((c) => {
    const allRecipients = c.homeworks.flatMap((h) => h.recipients);
    const avgProgress =
      allRecipients.length > 0
        ? Math.round(
            allRecipients.reduce((sum, r) => sum + r.progressPercent, 0) /
              allRecipients.length,
          )
        : 0;

    const pendingReviews = allRecipients.filter((r) =>
      ["SUBMITTED", "CHECKING"].includes(r.status),
    ).length;

    return {
      id: c.id,
      name: c.title,
      studentCount: c._count.students,
      avgProgress,
      homeworkCount: c.homeworks.length,
      pendingReviews,
    };
  });

  const mappedReviews: TeacherDashboardReview[] = reviews.map((r) => ({
    id: r.id,
    studentName: r.student.name ?? "Ученик",
    homeworkTitle: r.homework.title,
    submittedAt: formatSubmittedAt(r.submittedAt),
    status: r.status === "CHECKING" ? "needs_comment" : "pending",
  }));

  const mappedActivity: TeacherDashboardActivity[] = activityLogs.map((e) => ({
    id: e.id,
    avatarText: getAvatarText(e.student?.name, e.classroom?.title),
    text: getActivityMessage(e),
    time: formatRelativeTime(e.createdAt),
    badge: badgeFromType(e.type),
  }));

  const mappedDeadlines: TeacherDeadlineItem[] = deadlineHomeworks.map((hw) => {
    const submitted = hw.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING", "CHECKED", "RETURNED"].includes(r.status),
    ).length;
    return {
      id: hw.id,
      title: hw.title,
      classroomName: hw.classroom?.title ?? null,
      deadline: hw.deadline!,
      submittedCount: submitted,
      totalCount: hw.recipients.length,
    };
  });

  return {
    teacherName: teacher?.name ?? "Учитель",
    stats: {
      activeClassesCount: classrooms.length,
      totalStudentsCount: sumStudents,
      pendingReviewCount,
      avgScorePercent: Math.round(avgScoreResult._avg.scorePercent ?? 0),
    },
    classes: mappedClasses,
    reviews: mappedReviews,
    activityEvents: mappedActivity,
    upcomingDeadlines: mappedDeadlines,
  };
}
