"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";

export async function removeStudent(classId: string, classStudentId: string) {
  const user = await requireRole("TEACHER");

  const classroom = await prisma.classroom.findFirst({
    where: { id: classId, teacherId: user.id },
  });

  if (!classroom) throw new Error("Класс не найден");

  await prisma.classStudent.update({
    where: { id: classStudentId },
    data: { status: "REMOVED", removedAt: new Date() },
  });

  revalidatePath(`/dashboard/teacher/classes/${classId}`);
}
