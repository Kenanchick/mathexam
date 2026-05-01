"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/server";
import { taskImageStorage } from "@/lib/storage";

export async function deleteTask(taskId: string) {
  await requireRole("ADMIN");

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { imageUrls: true, solutionImageUrls: true },
  });
  if (!existing) return;

  await prisma.task.delete({ where: { id: taskId } });

  await Promise.all(
    [...existing.imageUrls, ...existing.solutionImageUrls].map((url) =>
      taskImageStorage.deleteTaskImage(url).catch(() => undefined),
    ),
  );

  revalidatePath("/dashboard/admin/tasks");
  revalidatePath("/dashboard/student/tasks");
  redirect("/dashboard/admin/tasks");
}
