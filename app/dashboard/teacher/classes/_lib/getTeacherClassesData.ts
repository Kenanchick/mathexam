import "server-only";

import { prisma } from "@/lib/prisma";

export type TeacherClassDetail = {
  id: string;
  title: string;
  description: string | null;
  inviteCode: string;
  studentCount: number;
  homeworkCount: number;
  pendingReviews: number;
  avgProgress: number;
  createdAt: Date;
};

export async function getTeacherClassesData(
  teacherId: string,
): Promise<TeacherClassDetail[]> {
  const classrooms = await prisma.classroom.findMany({
    where: { teacherId, isArchived: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      inviteCode: true,
      createdAt: true,
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
  });

  return classrooms.map((c) => {
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
      title: c.title,
      description: c.description,
      inviteCode: c.inviteCode,
      studentCount: c._count.students,
      homeworkCount: c.homeworks.length,
      pendingReviews,
      avgProgress,
      createdAt: c.createdAt,
    };
  });
}
