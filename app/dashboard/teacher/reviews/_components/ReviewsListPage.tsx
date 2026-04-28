"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PendingReviewItem } from "../_lib/getAllPendingReviews";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHours < 24)
    return `Сегодня, ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffHours < 48)
    return `Вчера, ${date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface ReviewsListPageProps {
  reviews: PendingReviewItem[];
}

export const ReviewsListPage = ({ reviews }: ReviewsListPageProps) => {
  const submittedCount = reviews.filter((r) => r.status === "SUBMITTED").length;
  const checkingCount = reviews.filter((r) => r.status === "CHECKING").length;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проверка работ</h1>
          <p className="mt-1 text-base text-gray-500">
            {reviews.length > 0
              ? `${reviews.length} работ ждут проверки · ${submittedCount} новых · ${checkingCount} в процессе`
              : "Все работы проверены"}
          </p>
        </div>
      </motion.div>

      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <ClipboardList className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-600">Нет работ на проверке</p>
            <p className="mt-1 text-sm text-gray-400">
              Когда ученики сдадут задания — они появятся здесь
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
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
                    Класс
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
                  const isLast = index === reviews.length - 1;
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.05 + index * 0.04 }}
                      className={`group transition-colors hover:bg-gray-50 ${!isLast ? "border-b border-gray-100" : ""}`}
                    >
                      <td className="py-3.5 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                            {getInitials(item.student.name)}
                          </div>
                          <span className="text-[15px] font-medium text-gray-800">
                            {item.student.name ?? "Ученик"}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[220px] py-3.5">
                        <span className="line-clamp-1 text-[15px] text-gray-700">
                          {item.homework.title}
                        </span>
                      </td>
                      <td className="py-3.5">
                        {item.homework.classroomName ? (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {item.homework.classroomName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Индивидуально</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatDate(item.submittedAt)}
                        </div>
                      </td>
                      <td className="py-3.5">
                        {item.status === "CHECKING" ? (
                          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
                            Проверяется
                          </span>
                        ) : (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                            На проверке
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pr-6">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg border-gray-200 text-xs font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Link href={`/dashboard/teacher/review/${item.id}`}>
                            Проверить
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
        </motion.div>
      )}
    </div>
  );
};
