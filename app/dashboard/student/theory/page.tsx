import { Suspense } from "react";
import { getAllTheoryQuizzes } from "./_lib/getTheoryQuizzes";
import { QuizGrid } from "./_components/QuizGrid";

export default async function TheoryPage() {
  const quizzes = await getAllTheoryQuizzes();
  const totalQuestions = quizzes.reduce((s, q) => s + q.questionCount, 0);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">Теория и формулы</h1>
        <p className="mt-1 text-[16px] text-gray-500">
          Проверь знание ключевых формул и теорем по каждому заданию ЕГЭ
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <div className="rounded border border-gray-200 bg-white px-5 py-4">
          <p className="text-[28px] font-bold leading-none text-gray-900">{quizzes.length}</p>
          <p className="mt-1 text-[13px] text-gray-500">тем всего</p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-5 py-4">
          <p className="text-[28px] font-bold leading-none text-gray-900">{totalQuestions}</p>
          <p className="mt-1 text-[13px] text-gray-500">вопросов</p>
        </div>
        <div className="rounded border border-gray-200 bg-white px-5 py-4">
          <p className="text-[28px] font-bold leading-none text-gray-900">19</p>
          <p className="mt-1 text-[13px] text-gray-500">заданий ЕГЭ</p>
        </div>
      </div>

      {/* Quiz grid */}
      <div className="rounded border border-gray-200 bg-white p-5">
        <Suspense fallback={<div className="py-10 text-center text-sm text-gray-400">Загрузка...</div>}>
          <QuizGrid quizzes={quizzes} />
        </Suspense>
      </div>
    </div>
  );
}
