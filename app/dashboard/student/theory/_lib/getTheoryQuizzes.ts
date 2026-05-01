import "server-only";

import { prisma } from "@/lib/prisma";

export type TheoryQuizSummary = {
  id: string;
  examNumber: number;
  topicTitle: string;
  topicSlug: string;
  description: string | null;
  questionCount: number;
};

export type TheoryQuizDetail = {
  id: string;
  examNumber: number;
  topicTitle: string;
  topicSlug: string;
  description: string | null;
  questions: Array<{
    id: string;
    type: "FORMULA_RECALL" | "CALCULATION" | "THEORETICAL";
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    order: number;
  }>;
};

export async function getAllTheoryQuizzes(): Promise<TheoryQuizSummary[]> {
  const quizzes = await prisma.theoryQuiz.findMany({
    orderBy: { examNumber: "asc" },
    select: {
      id: true,
      examNumber: true,
      topicTitle: true,
      topicSlug: true,
      description: true,
      _count: { select: { questions: true } },
    },
  });

  return quizzes.map((q) => ({
    id: q.id,
    examNumber: q.examNumber,
    topicTitle: q.topicTitle,
    topicSlug: q.topicSlug,
    description: q.description,
    questionCount: q._count.questions,
  }));
}

export async function getTheoryQuizBySlug(
  slug: string,
): Promise<TheoryQuizDetail | null> {
  const quiz = await prisma.theoryQuiz.findUnique({
    where: { topicSlug: slug },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!quiz) return null;

  return {
    id: quiz.id,
    examNumber: quiz.examNumber,
    topicTitle: quiz.topicTitle,
    topicSlug: quiz.topicSlug,
    description: quiz.description,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      type: q.type as TheoryQuizDetail["questions"][number]["type"],
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      order: q.order,
    })),
  };
}
