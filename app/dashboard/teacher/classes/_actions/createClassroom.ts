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
  | { success: true }
  | { success: false; error: string };

export async function createClassroom(
  formData: FormData,
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

  const raw = {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  };

  const parsed = schema.safeParse(raw);
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

  await prisma.classroom.create({
    data: {
      teacherId: user.id,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      inviteCode,
    },
  });

  revalidatePath("/dashboard/teacher/classes");
  return { success: true };
}
