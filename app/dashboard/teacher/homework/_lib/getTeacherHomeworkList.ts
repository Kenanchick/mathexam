import "server-only";

import { prisma } from "@/lib/prisma";
import type { HomeworkStatus } from "@/lib/generated/prisma/enums";

export type TeacherHomeworkItem = {
  id: string;
  title: string;
  description: string | null;
  classroomName: string | null;
  status: HomeworkStatus;
  deadline: Date | null;
  taskCount: number;
  recipientCount: number;
  submittedCount: number;
  pendingReviews: number;
  createdAt: Date;
  publishedAt: Date | null;
};

export async function getTeacherHomeworkList(
  teacherId: string,
): Promise<TeacherHomeworkItem[]> {
  const homeworks = await prisma.homework.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      deadline: true,
      createdAt: true,
      publishedAt: true,
      classroom: { select: { title: true } },
      _count: { select: { tasks: true } },
      recipients: { select: { status: true } },
    },
  });

  return homeworks.map((hw) => {
    const submittedCount = hw.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING", "CHECKED", "RETURNED"].includes(r.status),
    ).length;
    const pendingReviews = hw.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING"].includes(r.status),
    ).length;

    return {
      id: hw.id,
      title: hw.title,
      description: hw.description,
      classroomName: hw.classroom?.title ?? null,
      status: hw.status,
      deadline: hw.deadline,
      taskCount: hw._count.tasks,
      recipientCount: hw.recipients.length,
      submittedCount,
      pendingReviews,
      createdAt: hw.createdAt,
      publishedAt: hw.publishedAt,
    };
  });
}
