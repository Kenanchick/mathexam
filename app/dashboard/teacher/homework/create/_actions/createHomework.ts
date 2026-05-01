"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth/server";
import { createHomeworkSchema } from "../_lib/createHomeworkSchema";

export type CreateHomeworkResult =
  | { success: true; homeworkId: string; status: "DRAFT" | "PUBLISHED" }
  | { success: false; error: string };

export async function createHomework(
  input: unknown,
): Promise<CreateHomeworkResult> {
  let user;
  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) return { success: false, error: "Недостаточно прав" };
    return { success: false, error: "Ошибка авторизации" };
  }

  const parsed = createHomeworkSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
    };
  }

  const data = parsed.data;

  // Mode-specific validation
  if (data.recipientMode === "all" || data.recipientMode === "selected") {
    if (!data.classroomId) {
      return { success: false, error: "Выберите класс" };
    }
  }

  if (
    data.status === "PUBLISHED" &&
    (data.recipientMode === "selected" || data.recipientMode === "personal") &&
    data.selectedStudentIds.length === 0
  ) {
    return { success: false, error: "Выберите хотя бы одного ученика" };
  }

  let classroomId: string | null = null;
  let recipientIds: string[] = [];

  if (data.recipientMode === "personal") {
    // Verify selected students belong to teacher (either via class or direct link)
    const [classStudents, directStudents] = await Promise.all([
      prisma.classStudent.findMany({
        where: {
          status: "ACTIVE",
          studentId: { in: data.selectedStudentIds },
          classroom: { teacherId: user.id, isArchived: false },
        },
        select: { studentId: true },
      }),
      prisma.teacherStudent.findMany({
        where: {
          status: "ACTIVE",
          teacherId: user.id,
          studentId: { in: data.selectedStudentIds },
        },
        select: { studentId: true },
      }),
    ]);
    const allowedIds = new Set([
      ...classStudents.map((s) => s.studentId),
      ...directStudents.map((s) => s.studentId),
    ]);
    recipientIds = data.selectedStudentIds.filter((id) => allowedIds.has(id));

    if (recipientIds.length === 0 && data.status === "PUBLISHED") {
      return { success: false, error: "Выбранные ученики не найдены в ваших классах или среди личных" };
    }
  } else {
    // "all" or "selected" — class-based
    const classroom = await prisma.classroom.findFirst({
      where: { id: data.classroomId, teacherId: user.id },
      select: {
        id: true,
        students: {
          where: { status: "ACTIVE" },
          select: { studentId: true },
        },
      },
    });

    if (!classroom) {
      return { success: false, error: "Класс не найден" };
    }

    classroomId = classroom.id;
    recipientIds =
      data.recipientMode === "selected"
        ? data.selectedStudentIds
        : classroom.students.map((s) => s.studentId);
  }

  const homework = await prisma.homework.create({
    data: {
      teacherId: user.id,
      classroomId,
      title: data.title,
      description: data.description ?? null,
      deadline: new Date(data.deadlineAt),
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      allowRetries: data.settings.allowRetries,
      showSolutionAfterSubmit: data.settings.showSolutionAfterSubmit,
      tasks: {
        create: data.taskIds.map((taskId, i) => ({
          taskId,
          order: i + 1,
          points: 1,
        })),
      },
      recipients: {
        create: recipientIds.map((studentId) => ({
          studentId,
          status: "ASSIGNED",
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard/teacher");
  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/teacher/homework");

  return { success: true, homeworkId: homework.id, status: data.status };
}
