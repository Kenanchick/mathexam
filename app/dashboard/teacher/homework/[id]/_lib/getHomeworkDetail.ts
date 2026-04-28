import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  HomeworkStatus,
  HomeworkRecipientStatus,
} from "@/lib/generated/prisma/enums";

export type HomeworkRecipientDetail = {
  id: string;
  status: HomeworkRecipientStatus;
  submittedAt: Date | null;
  checkedAt: Date | null;
  scorePercent: number | null;
  teacherComment: string | null;
  student: { id: string; name: string | null };
};

export type HomeworkDetail = {
  id: string;
  title: string;
  description: string | null;
  status: HomeworkStatus;
  deadline: Date | null;
  classroomName: string | null;
  taskCount: number;
  createdAt: Date;
  publishedAt: Date | null;
  recipients: HomeworkRecipientDetail[];
};

const STATUS_PRIORITY: Partial<Record<HomeworkRecipientStatus, number>> = {
  SUBMITTED: 0,
  CHECKING: 1,
  RETURNED: 2,
  CHECKED: 3,
  IN_PROGRESS: 4,
  OVERDUE: 5,
  ASSIGNED: 6,
};

export async function getHomeworkDetail(
  homeworkId: string,
  teacherId: string,
): Promise<HomeworkDetail | null> {
  const hw = await prisma.homework.findUnique({
    where: { id: homeworkId },
    select: {
      id: true,
      teacherId: true,
      title: true,
      description: true,
      status: true,
      deadline: true,
      createdAt: true,
      publishedAt: true,
      classroom: { select: { title: true } },
      _count: { select: { tasks: true } },
      recipients: {
        select: {
          id: true,
          status: true,
          submittedAt: true,
          checkedAt: true,
          scorePercent: true,
          teacherComment: true,
          student: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!hw || hw.teacherId !== teacherId) return null;

  const sortedRecipients = [...hw.recipients].sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9),
  );

  return {
    id: hw.id,
    title: hw.title,
    description: hw.description,
    status: hw.status,
    deadline: hw.deadline,
    classroomName: hw.classroom?.title ?? null,
    taskCount: hw._count.tasks,
    createdAt: hw.createdAt,
    publishedAt: hw.publishedAt,
    recipients: sortedRecipients,
  };
}
