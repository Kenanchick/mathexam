import "server-only";

import { prisma } from "@/lib/prisma";
import type { TaskDifficulty } from "@/lib/generated/prisma/enums";

export type ClassroomOption = {
  id: string;
  title: string;
  students: { id: string; name: string | null }[];
};

export type TaskForPicker = {
  id: string;
  examNumber: number;
  title: string | null;
  condition: string;
  difficulty: TaskDifficulty;
  topicId: string;
  topicTitle: string;
};

export type TopicOption = {
  id: string;
  title: string;
};

export type CreateHomeworkPageData = {
  classrooms: ClassroomOption[];
  tasks: TaskForPicker[];
  topics: TopicOption[];
};

export async function getCreateHomeworkData(
  teacherId: string,
): Promise<CreateHomeworkPageData> {
  const [classrooms, tasks] = await Promise.all([
    prisma.classroom.findMany({
      where: { teacherId, isArchived: false },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        students: {
          where: { status: "ACTIVE" },
          select: {
            student: { select: { id: true, name: true } },
          },
        },
      },
    }),

    prisma.task.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ examNumber: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        examNumber: true,
        title: true,
        condition: true,
        difficulty: true,
        topic: { select: { id: true, title: true } },
      },
    }),
  ]);

  const topicMap = new Map<string, string>();
  const mappedTasks: TaskForPicker[] = tasks.map((t) => {
    topicMap.set(t.topic.id, t.topic.title);
    return {
      id: t.id,
      examNumber: t.examNumber,
      title: t.title,
      condition: t.condition,
      difficulty: t.difficulty,
      topicId: t.topic.id,
      topicTitle: t.topic.title,
    };
  });

  const topics: TopicOption[] = Array.from(topicMap.entries()).map(
    ([id, title]) => ({ id, title }),
  );

  const mappedClassrooms: ClassroomOption[] = classrooms.map((c) => ({
    id: c.id,
    title: c.title,
    students: c.students.map((cs) => cs.student),
  }));

  return { classrooms: mappedClassrooms, tasks: mappedTasks, topics };
}
