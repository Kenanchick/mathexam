import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { StudentDashboardView } from "../_lib/getStudentDashboard";

export const HomeworkPreviewCard = ({
  homework,
}: {
  homework: StudentDashboardView["homework"];
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-xl font-bold text-gray-900">Домашние задания</h2>

        <Link
          href="/dashboard/student/homework"
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Все задания
        </Link>
      </div>

      {homework.length === 0 ? (
        <div className="border-t border-gray-100 px-6 py-10 text-sm text-gray-500">
          У вас пока нет активных домашних заданий.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1.35fr_0.9fr_0.75fr_0.65fr] border-y border-gray-200 bg-gray-50/50 px-6 py-3 text-sm font-medium text-gray-500">
            <span>Название</span>
            <span>Учитель</span>
            <span>Дедлайн</span>
            <span>Статус</span>
          </div>

          <div>
            {homework.map((item) => (
              <div
                key={item.id}
                className="grid min-h-[64px] grid-cols-[1.35fr_0.9fr_0.75fr_0.65fr] items-center border-b border-gray-100 px-6 text-sm"
              >
                <p className="pr-4 font-semibold leading-snug text-gray-900">
                  {item.title}
                </p>

                <p className="text-gray-600">{item.teacherName}</p>

                <p className="text-gray-600">{item.deadline}</p>

                <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/student/homework"
            className="flex items-center justify-between px-6 py-4 text-sm font-semibold text-blue-600 transition hover:bg-blue-50/50"
          >
            Перейти ко всем заданиям
            <ChevronRight className="h-5 w-5" />
          </Link>
        </>
      )}
    </section>
  );
};
