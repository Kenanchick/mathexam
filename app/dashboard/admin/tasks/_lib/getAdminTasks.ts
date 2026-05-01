import { prisma } from "@/lib/prisma";
import type { TaskDifficulty, TaskStatus } from "@/lib/generated/prisma/enums";

export type AdminTaskListItem = {
  id: string;
  examNumber: number;
  title: string | null;
  topic: string;
  subtopic: string | null;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  hasImages: boolean;
  updatedAt: Date;
};

export async function getAdminTasks(): Promise<AdminTaskListItem[]> {
  const tasks = await prisma.task.findMany({
    orderBy: [
      { examNumber: "asc" },
      { updatedAt: "desc" },
    ],
    select: {
      id: true,
      examNumber: true,
      title: true,
      difficulty: true,
      status: true,
      imageUrls: true,
      imageUrl: true,
      updatedAt: true,
      topic: { select: { title: true } },
      subtopic: { select: { title: true } },
    },
  });

  return tasks.map((task) => ({
    id: task.id,
    examNumber: task.examNumber,
    title: task.title,
    topic: task.topic.title,
    subtopic: task.subtopic?.title ?? null,
    difficulty: task.difficulty,
    status: task.status,
    hasImages: task.imageUrls.length > 0 || Boolean(task.imageUrl),
    updatedAt: task.updatedAt,
  }));
}
