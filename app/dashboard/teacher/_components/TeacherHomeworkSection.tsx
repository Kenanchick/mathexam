"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeacherDashboardReview } from "../_lib/getTeacherDashboardData";

const statusConfig = {
  pending: {
    label: "На проверке",
    className: "bg-blue-50 text-blue-600",
  },
  needs_comment: {
    label: "Нужен комментарий",
    className: "bg-orange-50 text-orange-500",
  },
};

interface TeacherHomeworkSectionProps {
  reviews: TeacherDashboardReview[];
}

export const TeacherHomeworkSection = ({
  reviews,
}: TeacherHomeworkSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Работы на проверке
        </h2>
        <Link
          href="/dashboard/teacher/reviews"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Все работы
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <p className="text-sm font-medium text-gray-500">
            Новых работ на проверке нет
          </p>
          <p className="text-xs text-gray-400">
            Когда ученики сдадут задания — они появятся здесь
          </p>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 pl-6 text-left text-xs font-medium text-gray-400">
                Ученик
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-400">
                Домашнее задание
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-400">
                Сдано
              </th>
              <th className="py-3 text-left text-xs font-medium text-gray-400">
                Статус
              </th>
              <th className="py-3 pr-6 text-left text-xs font-medium text-gray-400">
                Действие
              </th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((item, index) => {
              const status = statusConfig[item.status];
              const isLast = index === reviews.length - 1;

              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.35 + index * 0.06 }}
                  className={`group transition-colors hover:bg-gray-50 ${!isLast ? "border-b border-gray-100" : ""}`}
                >
                  <td className="py-3.5 pl-6">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                        {item.studentName.charAt(0)}
                      </div>
                      <span className="text-[15px] font-medium text-gray-800">
                        {item.studentName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 text-[15px] text-gray-600">
                    {item.homeworkTitle}
                  </td>
                  <td className="py-3.5 text-[15px] text-gray-500">
                    {item.submittedAt}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3.5 pr-6">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg border-gray-200 text-xs font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Link href={`/dashboard/teacher/review/${item.id}`}>
                        {item.status === "needs_comment" ? "Открыть" : "Проверить"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <div className="border-t border-gray-100 px-6 py-3">
        <Link
          href="/dashboard/teacher/reviews"
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Перейти ко всем работам
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};
