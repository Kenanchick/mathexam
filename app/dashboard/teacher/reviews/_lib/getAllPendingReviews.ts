import "server-only";

import { prisma } from "@/lib/prisma";

export type PendingReviewItem = {
  id: string;
  status: "SUBMITTED" | "CHECKING";
  submittedAt: Date | null;
  student: { id: string; name: string | null };
  homework: { id: string; title: string; classroomName: string | null };
};

export async function getAllPendingReviews(
  teacherId: string,
): Promise<PendingReviewItem[]> {
  const recipients = await prisma.homeworkRecipient.findMany({
    where: {
      homework: { teacherId },
      status: { in: ["SUBMITTED", "CHECKING"] },
    },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      student: { select: { id: true, name: true } },
      homework: {
        select: {
          id: true,
          title: true,
          classroom: { select: { title: true } },
        },
      },
    },
  });

  return recipients.map((r) => ({
    id: r.id,
    status: r.status as "SUBMITTED" | "CHECKING",
    submittedAt: r.submittedAt,
    student: r.student,
    homework: {
      id: r.homework.id,
      title: r.homework.title,
      classroomName: r.homework.classroom?.title ?? null,
    },
  }));
}
