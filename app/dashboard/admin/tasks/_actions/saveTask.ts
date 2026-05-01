"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/server";
import { taskImageStorage } from "@/lib/storage";
import {
  TaskDifficulty,
  TaskStatus,
  AnswerType,
} from "@/lib/generated/prisma/enums";

import { taskFormSchema } from "./schemas";

export type SaveTaskState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function readArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
}

export async function saveTask(
  taskId: string | null,
  _prev: SaveTaskState,
  formData: FormData,
): Promise<SaveTaskState> {
  await requireRole("ADMIN");

  const raw = {
    examNumber: formData.get("examNumber"),
    topicMode: formData.get("topicMode"),
    topicId: formData.get("topicId") || undefined,
    newTopicTitle: formData.get("newTopicTitle") || undefined,
    newTopicSlug: formData.get("newTopicSlug") || undefined,
    newTopicDescription: formData.get("newTopicDescription") || undefined,
    newTopicOrder: formData.get("newTopicOrder") || undefined,

    subtopicMode: formData.get("subtopicMode"),
    subtopicId: formData.get("subtopicId") || undefined,
    newSubtopicTitle: formData.get("newSubtopicTitle") || undefined,
    newSubtopicSlug: formData.get("newSubtopicSlug") || undefined,
    newSubtopicDescription:
      formData.get("newSubtopicDescription") || undefined,
    newSubtopicOrder: formData.get("newSubtopicOrder") || undefined,

    title: formData.get("title") || "",
    condition: formData.get("condition") || "",
    difficulty: formData.get("difficulty"),
    answerType: formData.get("answerType"),
    correctAnswer: formData.get("correctAnswer") || "",
    acceptedAnswers: readArray(formData, "acceptedAnswers"),
    hints: readArray(formData, "hints"),
    solution: formData.get("solution") || "",
    source: formData.get("source") || "",
    solveTimeSec: formData.get("solveTimeSec") || undefined,

    imageUrls: readArray(formData, "imageUrls"),
    solutionImageUrls: readArray(formData, "solutionImageUrls"),

    status: formData.get("status"),
  };

  const parsed = taskFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      success: false,
      error: "Проверьте правильность полей формы",
      fieldErrors,
    };
  }

  const data = parsed.data;

  let topicId: string;
  if (data.topicMode === "existing") {
    topicId = data.topicId!;
  } else {
    const created = await prisma.topic.upsert({
      where: { slug: data.newTopicSlug! },
      update: {
        title: data.newTopicTitle!,
        description: data.newTopicDescription || null,
      },
      create: {
        slug: data.newTopicSlug!,
        title: data.newTopicTitle!,
        description: data.newTopicDescription || null,
        order: data.newTopicOrder ?? 1,
      },
      select: { id: true },
    });
    topicId = created.id;
  }

  let subtopicId: string | null = null;
  if (data.subtopicMode === "existing") {
    subtopicId = data.subtopicId!;
  } else if (data.subtopicMode === "new") {
    const created = await prisma.subtopic.upsert({
      where: {
        topicId_slug: { topicId, slug: data.newSubtopicSlug! },
      },
      update: {
        title: data.newSubtopicTitle!,
        description: data.newSubtopicDescription || null,
      },
      create: {
        topicId,
        slug: data.newSubtopicSlug!,
        title: data.newSubtopicTitle!,
        description: data.newSubtopicDescription || null,
        order: data.newSubtopicOrder ?? 1,
      },
      select: { id: true },
    });
    subtopicId = created.id;
  }

  const isPublished = data.status === "PUBLISHED";

  const baseData = {
    topicId,
    subtopicId,
    examNumber: data.examNumber,
    title: data.title?.trim() || null,
    condition: data.condition,
    imageUrls: data.imageUrls,
    solutionImageUrls: data.solutionImageUrls,
    difficulty: TaskDifficulty[data.difficulty],
    status: TaskStatus[data.status],
    answerType: AnswerType[data.answerType],
    correctAnswer: data.correctAnswer,
    acceptedAnswers:
      data.acceptedAnswers.length > 0
        ? data.acceptedAnswers
        : [data.correctAnswer],
    hints: data.hints,
    solution: data.solution?.trim() || null,
    source: data.source?.trim() || null,
    solveTimeSec: data.solveTimeSec ?? null,
  };

  if (taskId) {
    const existing = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        imageUrls: true,
        solutionImageUrls: true,
        publishedAt: true,
      },
    });
    if (!existing) {
      return { success: false, error: "Задача не найдена" };
    }

    const removedImages = existing.imageUrls.filter(
      (url) => !data.imageUrls.includes(url),
    );
    const removedSolutionImages = existing.solutionImageUrls.filter(
      (url) => !data.solutionImageUrls.includes(url),
    );

    await prisma.task.update({
      where: { id: taskId },
      data: {
        ...baseData,
        publishedAt:
          isPublished && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });

    await Promise.all(
      [...removedImages, ...removedSolutionImages].map((url) =>
        taskImageStorage.deleteTaskImage(url).catch(() => undefined),
      ),
    );
  } else {
    const author = await requireRole("ADMIN");
    const created = await prisma.task.create({
      data: {
        ...baseData,
        authorId: author.id,
        publishedAt: isPublished ? new Date() : null,
      },
      select: { id: true },
    });
    taskId = created.id;
  }

  revalidatePath("/dashboard/admin/tasks");
  revalidatePath(`/dashboard/admin/tasks/${taskId}/edit`);
  revalidatePath("/dashboard/student/tasks");

  redirect("/dashboard/admin/tasks");
}
