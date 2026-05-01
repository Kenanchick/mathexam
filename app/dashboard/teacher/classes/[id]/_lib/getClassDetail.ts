import "server-only";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export type ClassStudent = {
  id: string;
  studentId: string;
  name: string;
  email: string;
  joinedAt: Date;
  status: string;
  progressPercent: number;
  submittedCount: number;
  totalHomeworks: number;
};

export type ClassHomework = {
  id: string;
  title: string;
  deadline: Date | null;
  status: string;
  recipientCount: number;
  submittedCount: number;
};

export type ClassDetail = {
  id: string;
  title: string;
  description: string | null;
  inviteCode: string;
  createdAt: Date;
  studentCount: number;
  homeworkCount: number;
  avgProgress: number;
  pendingReviews: number;
  students: ClassStudent[];
  homeworks: ClassHomework[];
};

export async function getClassDetail(
  classId: string,
  teacherId: string,
): Promise<ClassDetail> {
  const classroom = await prisma.classroom.findFirst({
    where: { id: classId, teacherId, isArchived: false },
    select: {
      id: true,
      title: true,
      description: true,
      inviteCode: true,
      createdAt: true,
      students: {
        where: { status: "ACTIVE" },
        orderBy: { joinedAt: "desc" },
        select: {
          id: true,
          studentId: true,
          joinedAt: true,
          status: true,
          student: {
            select: { name: true, email: true },
          },
        },
      },
      homeworks: {
        where: { status: { in: ["PUBLISHED", "CLOSED"] } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          deadline: true,
          status: true,
          recipients: {
            select: { status: true, progressPercent: true, studentId: true },
          },
        },
      },
    },
  });

  if (!classroom) notFound();

  const students: ClassStudent[] = classroom.students.map((cs) => {
    const homeworksForStudent = classroom.homeworks.map((hw) => {
      const rec = hw.recipients.find((r) => r.studentId === cs.studentId);
      return rec ?? null;
    });
    const assigned = homeworksForStudent.filter(Boolean);
    const submitted = assigned.filter(
      (r) => r && ["SUBMITTED", "CHECKING", "CHECKED"].includes(r.status),
    ).length;
    const avgProgress =
      assigned.length > 0
        ? Math.round(
            assigned.reduce((s, r) => s + (r?.progressPercent ?? 0), 0) /
              assigned.length,
          )
        : 0;

    return {
      id: cs.id,
      studentId: cs.studentId,
      name: cs.student.name ?? "Без имени",
      email: cs.student.email,
      joinedAt: cs.joinedAt,
      status: cs.status,
      progressPercent: avgProgress,
      submittedCount: submitted,
      totalHomeworks: classroom.homeworks.length,
    };
  });

  const homeworks: ClassHomework[] = classroom.homeworks.map((hw) => ({
    id: hw.id,
    title: hw.title,
    deadline: hw.deadline,
    status: hw.status,
    recipientCount: hw.recipients.length,
    submittedCount: hw.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING", "CHECKED"].includes(r.status),
    ).length,
  }));

  const allRecipients = classroom.homeworks.flatMap((h) => h.recipients);
  const avgProgress =
    allRecipients.length > 0
      ? Math.round(
          allRecipients.reduce((s, r) => s + r.progressPercent, 0) /
            allRecipients.length,
        )
      : 0;
  const pendingReviews = allRecipients.filter((r) =>
    ["SUBMITTED", "CHECKING"].includes(r.status),
  ).length;

  return {
    id: classroom.id,
    title: classroom.title,
    description: classroom.description,
    inviteCode: classroom.inviteCode,
    createdAt: classroom.createdAt,
    studentCount: classroom.students.length,
    homeworkCount: classroom.homeworks.length,
    avgProgress,
    pendingReviews,
    students,
    homeworks,
  };
}
