import "server-only";

import { prisma } from "@/lib/prisma";

export type SessionAnswerState = {
  id: string;
  answer: string | null;
  fileUrl: string | null;
  result: "PENDING" | "CORRECT" | "WRONG" | "PARTIAL";
  score: number | null;
  teacherComment: string | null;
  submittedAt: Date | null;
  checkedAt: Date | null;
};

export type SessionTask = {
  homeworkTaskId: string;
  taskId: string;
  order: number;
  points: number;
  examNumber: number;
  title: string | null;
  condition: string;
  imageUrl: string | null;
  topicTitle: string;
  correctAnswer: string | null;
  answer: SessionAnswerState | null;
};

export type HomeworkSession = {
  recipientId: string;
  homeworkId: string;
  title: string;
  teacherName: string;
  deadline: Date | null;
  status:
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "CHECKING"
    | "CHECKED"
    | "RETURNED"
    | "OVERDUE";
  progressPercent: number;
  scorePercent: number | null;
  teacherComment: string | null;
  showSolutionAfterSubmit: boolean;
  tasks: SessionTask[];
};

export async function getHomeworkSession(
  recipientId: string,
  studentId: string,
): Promise<HomeworkSession | null> {
  const recipient = await prisma.homeworkRecipient.findUnique({
    where: { id: recipientId },
    select: {
      id: true,
      studentId: true,
      status: true,
      progressPercent: true,
      scorePercent: true,
      teacherComment: true,
      homework: {
        select: {
          id: true,
          title: true,
          deadline: true,
          showSolutionAfterSubmit: true,
          teacher: { select: { name: true } },
          tasks: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              order: true,
              points: true,
              task: {
                select: {
                  id: true,
                  examNumber: true,
                  title: true,
                  condition: true,
                  imageUrl: true,
                  correctAnswer: true,
                  topic: { select: { title: true } },
                },
              },
            },
          },
        },
      },
      answers: {
        select: {
          id: true,
          homeworkTaskId: true,
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
  });

  if (!recipient || recipient.studentId !== studentId) return null;

  const isChecked =
    recipient.status === "CHECKED" || recipient.status === "RETURNED";
  const showSolutions =
    recipient.homework.showSolutionAfterSubmit && isChecked;

  const answersByTaskId = new Map(
    recipient.answers.map((a) => [a.homeworkTaskId, a]),
  );

  const tasks: SessionTask[] = recipient.homework.tasks.map((ht) => {
    const ans = answersByTaskId.get(ht.id) ?? null;
    return {
      homeworkTaskId: ht.id,
      taskId: ht.task.id,
      order: ht.order,
      points: ht.points,
      examNumber: ht.task.examNumber,
      title: ht.task.title,
      condition: ht.task.condition,
      imageUrl: ht.task.imageUrl,
      topicTitle: ht.task.topic.title,
      correctAnswer: showSolutions ? ht.task.correctAnswer : null,
      answer: ans
        ? {
            id: ans.id,
            answer: ans.answer,
            fileUrl: ans.fileUrl,
            result: ans.result as SessionAnswerState["result"],
            score: ans.score,
            teacherComment: ans.teacherComment,
            submittedAt: ans.submittedAt,
            checkedAt: ans.checkedAt,
          }
        : null,
    };
  });

  return {
    recipientId: recipient.id,
    homeworkId: recipient.homework.id,
    title: recipient.homework.title,
    teacherName: recipient.homework.teacher.name ?? "Преподаватель",
    deadline: recipient.homework.deadline,
    status: recipient.status as HomeworkSession["status"],
    progressPercent: recipient.progressPercent,
    scorePercent: recipient.scorePercent,
    teacherComment: recipient.teacherComment,
    showSolutionAfterSubmit: recipient.homework.showSolutionAfterSubmit,
    tasks,
  };
}
