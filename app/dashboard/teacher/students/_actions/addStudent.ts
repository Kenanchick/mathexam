"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Неверный email"),
  note: z.string().trim().max(300).optional(),
});

export type AddStudentResult =
  | { success: true; student: { id: string; name: string | null; email: string } }
  | { success: false; error: string };

export async function addStudentByEmail(input: unknown): Promise<AddStudentResult> {
  const teacher = await requireRole("TEACHER");

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ошибка" };
  }

  const { email, note } = parsed.data;

  const student = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!student) {
    return {
      success: false,
      error: "Ученик с таким email не зарегистрирован. Поделитесь кодом приглашения.",
    };
  }

  if (student.role !== "STUDENT") {
    return { success: false, error: "Этот пользователь не является учеником" };
  }

  const existing = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId: teacher.id, studentId: student.id } },
  });

  if (existing && existing.status === "ACTIVE") {
    return { success: false, error: "Этот ученик уже у вас" };
  }

  if (existing) {
    await prisma.teacherStudent.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", removedAt: null, note: note ?? existing.note },
    });
  } else {
    await prisma.teacherStudent.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        note: note ?? null,
      },
    });
  }

  revalidatePath("/dashboard/teacher/students");
  return {
    success: true,
    student: { id: student.id, name: student.name, email: student.email },
  };
}

export async function removeDirectStudent(teacherStudentId: string) {
  const teacher = await requireRole("TEACHER");

  const link = await prisma.teacherStudent.findFirst({
    where: { id: teacherStudentId, teacherId: teacher.id },
  });

  if (!link) throw new Error("Связь не найдена");

  await prisma.teacherStudent.update({
    where: { id: teacherStudentId },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath("/dashboard/teacher/students");
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function ensurePersonalInviteCode(): Promise<string> {
  const teacher = await requireRole("TEACHER");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: teacher.id },
    select: { id: true, personalInviteCode: true },
  });

  if (profile?.personalInviteCode) return profile.personalInviteCode;

  let code = generateInviteCode();
  // ensure unique
  for (let i = 0; i < 5; i++) {
    const collision = await prisma.teacherProfile.findUnique({
      where: { personalInviteCode: code },
    });
    if (!collision) break;
    code = generateInviteCode();
  }

  if (profile) {
    await prisma.teacherProfile.update({
      where: { id: profile.id },
      data: { personalInviteCode: code },
    });
  } else {
    await prisma.teacherProfile.create({
      data: { userId: teacher.id, personalInviteCode: code },
    });
  }

  revalidatePath("/dashboard/teacher/students");
  return code;
}
