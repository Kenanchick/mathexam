import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

export const HomeworkPreviewCard = ({
  homework,
}: {
  homework: StudentDashboardView["homework"];
}) => {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3.5">
        <h2 className="text-[18px] font-semibold text-gray-900">
          Домашние задания
        </h2>
        <Link
          href="/dashboard/student/homework"
          className="text-[15px] text-gray-500 transition hover:text-gray-900"
        >
          Все задания →
        </Link>
      </div>

      {homework.length === 0 ? (
        <div className="px-6 py-8 text-[16px] text-gray-500">
          У вас пока нет активных домашних заданий.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.55fr_1fr_0.85fr_0.75fr] border-b border-gray-200 px-6 py-3 text-[13px] font-medium uppercase tracking-wide text-gray-500">
            <span>Название</span>
            <span>Учитель</span>
            <span>Дедлайн</span>
            <span>Статус</span>
          </div>

          <div className="divide-y divide-gray-200">
            {homework.map((item) => (
              <div
                key={item.id}
                className="grid min-h-[60px] grid-cols-[1.55fr_1fr_0.85fr_0.75fr] items-center px-6 py-1.5"
              >
                <p className="pr-4 text-[16px] font-medium text-gray-900">
                  {item.title}
                </p>
                <p className="text-[16px] text-gray-600">{item.teacherName}</p>
                <p className="text-[16px] text-gray-600">{item.deadline}</p>
                <span className="inline-flex h-7 min-w-[104px] items-center justify-center rounded border border-gray-300 bg-gray-50 px-3 text-[14px] font-medium text-gray-700">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/student/homework"
            className="flex items-center justify-between border-t border-gray-200 px-6 py-3.5 text-[15px] text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            Перейти ко всем заданиям
            <ChevronRight className="h-5 w-5" />
          </Link>
        </>
      )}
    </section>
  );
};
