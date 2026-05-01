"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(100),
  school: z.string().max(200).optional(),
  grade: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
});

export async function updateProfile(formData: FormData) {
  const user = await requireRole("STUDENT");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    school: formData.get("school") || undefined,
    grade: formData.get("grade") || undefined,
    city: formData.get("city") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };
  }

  const { name, school, grade, city } = parsed.data;

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name } }),
    prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: { school: school ?? null, grade: grade ?? null, city: city ?? null },
      create: { userId: user.id, school: school ?? null, grade: grade ?? null, city: city ?? null },
    }),
  ]);

  revalidatePath("/dashboard/student/profile");
  return { success: true };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: z.string().min(8, "Минимум 8 символов"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export async function updatePassword(formData: FormData) {
  const user = await requireRole("STUDENT");

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ошибка валидации" };
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  const isValid = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return { success: false, error: "Неверный текущий пароль" };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return { success: true };
}
