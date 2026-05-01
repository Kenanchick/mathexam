"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, isAuthError } from "@/lib/auth/server";

const schema = z.object({
  title: z
    .string()
    .min(1, "Введите название класса")
    .max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional(),
  studentIds: z.array(z.string()).default([]),
});

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

export type CreateClassroomResult =
  | { success: true; classroomId: string }
  | { success: false; error: string };

export async function createClassroom(
  input: { title: string; description?: string; studentIds?: string[] },
): Promise<CreateClassroomResult> {
  let user;
  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      return { success: false, error: "Недостаточно прав" };
    }
    return { success: false, error: "Ошибка авторизации" };
  }

  const parsed = schema.safeParse({
    title: input.title,
    description: input.description || undefined,
    studentIds: input.studentIds ?? [],
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
    };
  }

  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.classroom.findUnique({
      where: { inviteCode },
      select: { id: true },
    });
    if (!exists) break;
    inviteCode = generateInviteCode();
  }

  // Verify selected students are actually direct students of this teacher
  let validStudentIds: string[] = [];
  if (parsed.data.studentIds.length > 0) {
    const directLinks = await prisma.teacherStudent.findMany({
      where: {
        teacherId: user.id,
        status: "ACTIVE",
        studentId: { in: parsed.data.studentIds },
      },
      select: { id: true, studentId: true },
    });
    validStudentIds = directLinks.map((l) => l.studentId);
  }

  const classroom = await prisma.classroom.create({
    data: {
      teacherId: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      inviteCode,
      students: {
        create: validStudentIds.map((studentId) => ({
          studentId,
          status: "ACTIVE",
        })),
      },
    },
    select: { id: true },
  });

  // Move from "personal" to class — mark direct links as removed
  if (validStudentIds.length > 0) {
    await prisma.teacherStudent.updateMany({
      where: {
        teacherId: user.id,
        studentId: { in: validStudentIds },
        status: "ACTIVE",
      },
      data: { status: "REMOVED", removedAt: new Date() },
    });
  }

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/teacher/students");
  return { success: true, classroomId: classroom.id };
}

const addStudentsSchema = z.object({
  classroomId: z.string().min(1),
  studentIds: z.array(z.string()).min(1, "Выберите хотя бы одного ученика"),
});

export type AddStudentsResult =
  | { success: true; addedCount: number }
  | { success: false; error: string };

export async function addPersonalStudentsToClass(
  input: { classroomId: string; studentIds: string[] },
): Promise<AddStudentsResult> {
  let user;
  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      return { success: false, error: "Недостаточно прав" };
    }
    return { success: false, error: "Ошибка авторизации" };
  }

  const parsed = addStudentsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
    };
  }

  const classroom = await prisma.classroom.findFirst({
    where: { id: parsed.data.classroomId, teacherId: user.id, isArchived: false },
    select: { id: true },
  });
  if (!classroom) {
    return { success: false, error: "Класс не найден" };
  }

  // Filter only valid direct students of this teacher
  const directLinks = await prisma.teacherStudent.findMany({
    where: {
      teacherId: user.id,
      status: "ACTIVE",
      studentId: { in: parsed.data.studentIds },
    },
    select: { studentId: true },
  });
  const validIds = directLinks.map((l) => l.studentId);
  if (validIds.length === 0) {
    return { success: false, error: "Учеников не найдено среди личных" };
  }

  // Check which are already in this class (re-activate if removed)
  const existing = await prisma.classStudent.findMany({
    where: {
      classroomId: classroom.id,
      studentId: { in: validIds },
    },
    select: { id: true, studentId: true, status: true },
  });
  const existingMap = new Map(existing.map((e) => [e.studentId, e]));

  for (const studentId of validIds) {
    const ex = existingMap.get(studentId);
    if (ex) {
      if (ex.status !== "ACTIVE") {
        await prisma.classStudent.update({
          where: { id: ex.id },
          data: { status: "ACTIVE", removedAt: null },
        });
      }
    } else {
      await prisma.classStudent.create({
        data: { classroomId: classroom.id, studentId, status: "ACTIVE" },
      });
    }
  }

  // Mark direct links as removed (student now in a class)
  await prisma.teacherStudent.updateMany({
    where: {
      teacherId: user.id,
      studentId: { in: validIds },
      status: "ACTIVE",
    },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath(`/dashboard/teacher/classes/${classroom.id}`);
  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/teacher/students");
  return { success: true, addedCount: validIds.length };
}
