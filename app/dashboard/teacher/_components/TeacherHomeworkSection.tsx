"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TeacherDashboardReview } from "../_lib/getTeacherDashboardData";

const statusConfig = {
  pending: {
    label: "На проверке",
    className: "border border-gray-200 bg-gray-50 text-gray-600",
  },
  needs_comment: {
    label: "На проверке",
    className: "border border-gray-200 bg-gray-50 text-gray-600",
  },
};

const columns = ["Ученик", "Домашнее задание", "Сдано", "Статус", ""];

interface TeacherHomeworkSectionProps {
  reviews: TeacherDashboardReview[];
}

export const TeacherHomeworkSection = ({ reviews }: TeacherHomeworkSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <h2 className="text-[16px] font-semibold text-gray-900">Работы на проверке</h2>
        <Link
          href="/dashboard/teacher/reviews"
          className="text-[13px] font-medium text-gray-500 transition hover:text-gray-800"
        >
          Все работы
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] font-medium text-gray-500">Новых работ на проверке нет</p>
          <p className="mt-1 text-[13px] text-gray-400">
            Когда ученики сдадут задания — они появятся здесь
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-gray-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((item, index) => {
                const status = statusConfig[item.status];
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
                    className="transition-colors hover:bg-gray-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600">
                          {item.studentName.charAt(0)}
                        </div>
                        <span className="text-[14px] font-medium text-gray-800">
                          {item.studentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-gray-600">
                      {item.homeworkTitle}
                    </td>
                    <td className="px-5 py-3.5 text-[14px] text-gray-500">
                      {item.submittedAt}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded px-2 py-0.5 text-[12px] font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/teacher/review/${item.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded border border-gray-300 px-3 text-[13px] font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Проверить
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-gray-200 px-5 py-2.5">
        <Link
          href="/dashboard/teacher/reviews"
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition hover:text-gray-800"
        >
          Перейти ко всем работам
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
};
