import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

export const ContinueTrainingCard = ({
  training,
}: {
  training: StudentDashboardView["currentTraining"];
}) => {
  if (!training) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-bold text-gray-900">
          Продолжить тренировку
        </h2>

        <p className="text-sm text-gray-500">
          Все опубликованные задачи уже решены. Отличная работа!
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Продолжить тренировку
      </h2>

      <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600">
        Следующая задача
      </span>

      <h3 className="mt-4 text-xl font-bold text-gray-900">{training.title}</h3>

      <p className="mt-2 text-sm text-gray-500">{training.topic}</p>

      <div className="mt-7 flex items-center justify-between text-sm">
        <p className="font-medium text-gray-900">
          Прогресс: <span className="font-bold">{training.progressText}</span>
        </p>

        <span className="font-semibold text-gray-900">
          {training.progressPercent}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${training.progressPercent}%` }}
        />
      </div>

      <div className="mt-7 flex items-center gap-3">
        <Link
          href={`/dashboard/student/tasks/${training.taskId}`}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Продолжить
        </Link>

        <button
          type="button"
          className="flex h-11 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-blue-200 hover:text-blue-600"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};
