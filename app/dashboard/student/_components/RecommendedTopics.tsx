import { BookOpen } from "lucide-react";
import Link from "next/link";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

export const RecommendedTopics = ({
  topics,
}: {
  topics: StudentDashboardView["recommendedTopics"];
}) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Рекомендованные темы
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Темы, которые стоит повторить
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-500">
          Пока недостаточно данных для рекомендаций. Решите несколько задач.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <BookOpen className="h-6 w-6" />
                </div>

                <h3 className="text-sm font-bold text-gray-900">
                  {topic.title}
                </h3>
              </div>

              <p className="min-h-[54px] line-clamp-3 text-sm leading-snug text-gray-500">
                {topic.description}
              </p>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{ width: `${topic.percent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-500">Освоение</span>
                <span className="font-semibold text-red-500">
                  {topic.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/student/tasks"
        className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:underline"
      >
        Смотреть все темы →
      </Link>
    </section>
  );
};
