import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type {
  AnswerType,
  TaskDifficulty,
  TaskStatus,
} from "@/lib/generated/prisma/enums";

export type TaskForEdit = {
  id: string;
  examNumber: number;
  topicId: string;
  subtopicId: string | null;
  title: string | null;
  condition: string;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  answerType: AnswerType;
  correctAnswer: string;
  acceptedAnswers: string[];
  hints: string[];
  solution: string | null;
  source: string | null;
  solveTimeSec: number | null;
  imageUrls: string[];
  solutionImageUrls: string[];
};

export async function getTaskForEdit(taskId: string): Promise<TaskForEdit> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      examNumber: true,
      topicId: true,
      subtopicId: true,
      title: true,
      condition: true,
      difficulty: true,
      status: true,
      answerType: true,
      correctAnswer: true,
      acceptedAnswers: true,
      hints: true,
      solution: true,
      source: true,
      solveTimeSec: true,
      imageUrls: true,
      imageUrl: true,
      solutionImageUrls: true,
    },
  });

  if (!task) notFound();

  const imageUrls =
    task.imageUrls.length > 0
      ? task.imageUrls
      : task.imageUrl
        ? [task.imageUrl]
        : [];

  return {
    id: task.id,
    examNumber: task.examNumber,
    topicId: task.topicId,
    subtopicId: task.subtopicId,
    title: task.title,
    condition: task.condition,
    difficulty: task.difficulty,
    status: task.status,
    answerType: task.answerType,
    correctAnswer: task.correctAnswer,
    acceptedAnswers: task.acceptedAnswers,
    hints: task.hints,
    solution: task.solution,
    source: task.source,
    solveTimeSec: task.solveTimeSec,
    imageUrls,
    solutionImageUrls: task.solutionImageUrls,
  };
}
