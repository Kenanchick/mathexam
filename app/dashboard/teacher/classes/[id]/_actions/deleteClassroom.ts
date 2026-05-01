"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export type DeleteClassroomResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteClassroom(classId: string): Promise<DeleteClassroomResult> {
  const user = await requireRole("TEACHER");

  const classroom = await prisma.classroom.findFirst({
    where: { id: classId, teacherId: user.id },
    select: { id: true },
  });

  if (!classroom) {
    return { success: false, error: "Класс не найден" };
  }

  // Cascade удалит ClassStudent. Homework.classroomId станет null (SetNull).
  await prisma.classroom.delete({ where: { id: classroom.id } });

  revalidatePath("/dashboard/teacher/classes");
  revalidatePath("/dashboard/teacher/students");
  revalidatePath("/dashboard/teacher/homework");
  return { success: true };
}
