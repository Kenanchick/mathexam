import "server-only";
import { prisma } from "@/lib/prisma";

export type TeacherStudent = {
  /** ClassStudent.id (для классовых учеников) или TeacherStudent.id (для прямых) */
  id: string;
  studentId: string;
  name: string;
  email: string;
  /** null означает прямого ученика без класса */
  classroomId: string | null;
  classroomTitle: string | null;
  joinedAt: Date;
  progressPercent: number;
  submittedCount: number;
  totalHomeworks: number;
  pendingCount: number;
  /** "class" — через класс, "direct" — напрямую */
  source: "class" | "direct";
  note?: string | null;
};

export async function getTeacherStudents(teacherId: string): Promise<TeacherStudent[]> {
  const [classrooms, directLinks, directHomeworks] = await Promise.all([
    prisma.classroom.findMany({
      where: { teacherId, isArchived: false },
      select: {
        id: true,
        title: true,
        students: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            studentId: true,
            joinedAt: true,
            student: { select: { name: true, email: true } },
          },
        },
        homeworks: {
          where: { status: { in: ["PUBLISHED", "CLOSED"] } },
          select: {
            recipients: {
              select: { studentId: true, status: true, progressPercent: true },
            },
          },
        },
      },
    }),
    prisma.teacherStudent.findMany({
      where: { teacherId, status: "ACTIVE" },
      orderBy: { joinedAt: "desc" },
      select: {
        id: true,
        studentId: true,
        joinedAt: true,
        note: true,
        student: { select: { name: true, email: true } },
      },
    }),
    // Personal homeworks (without classroom) addressed to direct students
    prisma.homework.findMany({
      where: { teacherId, classroomId: null, status: { in: ["PUBLISHED", "CLOSED"] } },
      select: {
        id: true,
        recipients: {
          select: { studentId: true, status: true, progressPercent: true },
        },
      },
    }),
  ]);

  const students: TeacherStudent[] = [];

  // Class-based students
  for (const cls of classrooms) {
    for (const cs of cls.students) {
      const allRecipients = cls.homeworks.flatMap((h) => h.recipients);
      const forStudent = allRecipients.filter((r) => r.studentId === cs.studentId);
      const submitted = forStudent.filter((r) =>
        ["SUBMITTED", "CHECKING", "CHECKED"].includes(r.status),
      ).length;
      const pending = forStudent.filter((r) =>
        ["SUBMITTED", "CHECKING"].includes(r.status),
      ).length;
      const avgProgress =
        forStudent.length > 0
          ? Math.round(forStudent.reduce((s, r) => s + r.progressPercent, 0) / forStudent.length)
          : 0;

      students.push({
        id: cs.id,
        studentId: cs.studentId,
        name: cs.student.name ?? "Без имени",
        email: cs.student.email,
        classroomId: cls.id,
        classroomTitle: cls.title,
        joinedAt: cs.joinedAt,
        progressPercent: avgProgress,
        submittedCount: submitted,
        totalHomeworks: cls.homeworks.length,
        pendingCount: pending,
        source: "class",
      });
    }
  }

  // Direct students (without class)
  const directRecipients = directHomeworks.flatMap((h) => h.recipients);
  for (const link of directLinks) {
    const forStudent = directRecipients.filter((r) => r.studentId === link.studentId);
    const submitted = forStudent.filter((r) =>
      ["SUBMITTED", "CHECKING", "CHECKED"].includes(r.status),
    ).length;
    const pending = forStudent.filter((r) =>
      ["SUBMITTED", "CHECKING"].includes(r.status),
    ).length;
    const avgProgress =
      forStudent.length > 0
        ? Math.round(forStudent.reduce((s, r) => s + r.progressPercent, 0) / forStudent.length)
        : 0;

    students.push({
      id: link.id,
      studentId: link.studentId,
      name: link.student.name ?? "Без имени",
      email: link.student.email,
      classroomId: null,
      classroomTitle: null,
      joinedAt: link.joinedAt,
      progressPercent: avgProgress,
      submittedCount: submitted,
      totalHomeworks: directHomeworks.length,
      pendingCount: pending,
      source: "direct",
      note: link.note,
    });
  }

  return students;
}
