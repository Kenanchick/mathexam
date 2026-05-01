import Link from "next/link";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

export const RecommendedTopics = ({
  topics,
}: {
  topics: StudentDashboardView["recommendedTopics"];
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3.5">
        <h2 className="text-[18px] font-semibold text-gray-900">
          Рекомендованные темы
        </h2>
        <Link
          href="/dashboard/student/tasks"
          className="text-[15px] text-gray-500 transition hover:text-gray-900"
        >
          Все темы →
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="px-6 py-8 text-[16px] text-gray-500">
          Пока недостаточно данных для рекомендаций. Решите несколько задач.
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="flex min-h-[66px] items-center gap-7 px-6 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium text-gray-900">
                  {topic.title}
                </p>
                <p className="mt-1 line-clamp-1 text-[15px] text-gray-500">
                  {topic.description}
                </p>
              </div>

              <div className="w-40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 flex-1 overflow-hidden rounded-sm bg-gray-200">
                    <div
                      className="h-full bg-gray-600"
                      style={{ width: `${topic.percent}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-[14px] font-medium text-gray-600">
                    {topic.percent}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
