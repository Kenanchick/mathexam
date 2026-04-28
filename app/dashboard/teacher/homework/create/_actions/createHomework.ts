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

  if (
    data.status === "PUBLISHED" &&
    data.recipientMode === "selected" &&
    data.selectedStudentIds.length === 0
  ) {
    return { success: false, error: "Выберите хотя бы одного ученика" };
  }

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

  let recipientIds: string[];
  if (data.recipientMode === "selected") {
    recipientIds = data.selectedStudentIds;
  } else {
    // "all" and "individual" (TODO: individual sets per student)
    recipientIds = classroom.students.map((s) => s.studentId);
  }

  const homework = await prisma.homework.create({
    data: {
      teacherId: user.id,
      classroomId: data.classroomId,
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

  return { success: true, homeworkId: homework.id, status: data.status };
}
