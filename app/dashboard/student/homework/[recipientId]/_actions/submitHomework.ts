"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const submitSchema = z.object({
  recipientId: z.string().min(1),
});

export async function submitHomework(input: unknown) {
  let student;
  try {
    student = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }
    throw error;
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Неверные данные" };
  }

  const { recipientId } = parsed.data;

  const recipient = await prisma.homeworkRecipient.findUnique({
    where: { id: recipientId },
    select: {
      id: true,
      studentId: true,
      status: true,
      homeworkId: true,
    },
  });

  if (!recipient || recipient.studentId !== student.id) {
    return { success: false as const, error: "Задание не найдено" };
  }

  if (!["ASSIGNED", "IN_PROGRESS", "RETURNED"].includes(recipient.status)) {
    return { success: false as const, error: "Работа уже сдана" };
  }

  await prisma.homeworkRecipient.update({
    where: { id: recipientId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/dashboard/student/homework/${recipientId}`);
  revalidatePath("/dashboard/student/homework");
  revalidatePath("/dashboard/student");
  revalidatePath(`/dashboard/teacher/review/${recipientId}`);
  revalidatePath(`/dashboard/teacher/homework/${recipient.homeworkId}`);
  revalidatePath("/dashboard/teacher/homework");
  revalidatePath("/dashboard/teacher/reviews");
  revalidatePath("/dashboard/teacher");

  return { success: true as const };
}
