import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  HomeworkRecipientStatus,
  AttemptResult,
  AnswerType,
} from "@/lib/generated/prisma/enums";

export type ReviewAnswerData = {
  id: string;
  answer: string | null;
  fileUrl: string | null;
  result: AttemptResult;
  score: number | null;
  teacherComment: string | null;
  submittedAt: Date | null;
  checkedAt: Date | null;
};

export type ReviewTaskItem = {
  homeworkTaskId: string;
  taskId: string;
  order: number;
  examNumber: number;
  title: string | null;
  condition: string;
  correctAnswer: string;
  answerType: AnswerType;
  topicTitle: string;
  maxPoints: number;
  answer: ReviewAnswerData | null;
};

export type ReviewData = {
  submissionId: string;
  status: HomeworkRecipientStatus;
  submittedAt: Date | null;
  teacherComment: string | null;
  scorePercent: number | null;
  student: { id: string; name: string | null };
  homework: {
    id: string;
    title: string;
    classroomName: string | null;
    isVariant: boolean;
  };
  tasks: ReviewTaskItem[];
};

export async function getReviewData(
  submissionId: string,
  teacherId: string,
): Promise<ReviewData | null> {
  const recipient = await prisma.homeworkRecipient.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      teacherComment: true,
      scorePercent: true,
      student: { select: { id: true, name: true } },
      homework: {
        select: {
          id: true,
          teacherId: true,
          title: true,
          classroom: { select: { title: true } },
          tasks: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              taskId: true,
              order: true,
              points: true,
              task: {
                select: {
                  examNumber: true,
                  title: true,
                  condition: true,
                  correctAnswer: true,
                  answerType: true,
                  topic: { select: { title: true } },
                },
              },
              answers: {
                where: { homeworkRecipientId: submissionId },
                orderBy: { attemptNo: "desc" },
                take: 1,
                select: {
                  id: true,
                  answer: true,
                  fileUrl: true,
                  result: true,
                  score: true,
                  teacherComment: true,
                  submittedAt: true,
                  checkedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!recipient) return null;
  if (recipient.homework.teacherId !== teacherId) return null;

  const examNumbers = recipient.homework.tasks.map((t) => t.task.examNumber);
  const isVariant =
    examNumbers.length >= 10 &&
    examNumbers.some((n) => n <= 12) &&
    examNumbers.some((n) => n >= 13);

  const tasks: ReviewTaskItem[] = recipient.homework.tasks.map((ht) => ({
    homeworkTaskId: ht.id,
    taskId: ht.taskId,
    order: ht.order,
    examNumber: ht.task.examNumber,
    title: ht.task.title,
    condition: ht.task.condition,
    correctAnswer: ht.task.correctAnswer,
    answerType: ht.task.answerType,
    topicTitle: ht.task.topic.title,
    maxPoints: ht.points,
    answer: ht.answers[0] ?? null,
  }));

  return {
    submissionId: recipient.id,
    status: recipient.status,
    submittedAt: recipient.submittedAt,
    teacherComment: recipient.teacherComment,
    scorePercent: recipient.scorePercent,
    student: recipient.student,
    homework: {
      id: recipient.homework.id,
      title: recipient.homework.title,
      classroomName: recipient.homework.classroom?.title ?? null,
      isVariant,
    },
    tasks,
  };
}
