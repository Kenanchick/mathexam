"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  BookOpen,
  Users,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HomeworkDetail } from "../_lib/getHomeworkDetail";
import type {
  HomeworkStatus,
  HomeworkRecipientStatus,
} from "@/lib/generated/prisma/enums";

const HW_STATUS_LABEL: Record<HomeworkStatus, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Активно",
  CLOSED: "Завершено",
  ARCHIVED: "В архиве",
};

const HW_STATUS_STYLE: Record<HomeworkStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-500",
  ARCHIVED: "bg-gray-100 text-gray-400",
};

const REC_STATUS_LABEL: Record<HomeworkRecipientStatus, string> = {
  ASSIGNED: "Назначено",
  IN_PROGRESS: "Выполняется",
  SUBMITTED: "На проверке",
  CHECKING: "Проверяется",
  CHECKED: "Проверено",
  RETURNED: "Возвращено",
  OVERDUE: "Просрочено",
};

const REC_STATUS_STYLE: Record<HomeworkRecipientStatus, string> = {
  ASSIGNED: "bg-gray-100 text-gray-500",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  SUBMITTED: "bg-orange-50 text-orange-600",
  CHECKING: "bg-yellow-50 text-yellow-700",
  CHECKED: "bg-emerald-50 text-emerald-700",
  RETURNED: "bg-purple-50 text-purple-700",
  OVERDUE: "bg-red-50 text-red-600",
};

function formatDeadline(date: Date | null): string {
  if (!date) return "Без дедлайна";
  return new Date(date).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSubmittedAt(date: Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMin < 60) return `${diffMin} мин. назад`;
  if (diffHours < 24)
    return `Сегодня, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffHours < 48)
    return `Вчера, ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface StatCardProps {
  label: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  highlight?: boolean;
  delay: number;
}

const StatCard = ({ label, value, total, icon, highlight, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className={`rounded-2xl border p-4 ${
      highlight && value > 0
        ? "border-orange-200 bg-orange-50"
        : "border-gray-200 bg-white"
    }`}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <span className={highlight && value > 0 ? "text-orange-500" : "text-gray-400"}>
        {icon}
      </span>
    </div>
    <p
      className={`mt-2 text-2xl font-bold ${
        highlight && value > 0 ? "text-orange-600" : "text-gray-900"
      }`}
    >
      {value}
      {total !== undefined && (
        <span className="text-base font-normal text-gray-400"> / {total}</span>
      )}
    </p>
  </motion.div>
);

interface HomeworkDetailPageProps {
  data: HomeworkDetail;
}

export const HomeworkDetailPage = ({ data }: HomeworkDetailPageProps) => {
  const stats = useMemo(() => {
    const submitted = data.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING", "CHECKED", "RETURNED"].includes(r.status),
    ).length;
    const checked = data.recipients.filter((r) =>
      ["CHECKED", "RETURNED"].includes(r.status),
    ).length;
    const pending = data.recipients.filter((r) =>
      ["SUBMITTED", "CHECKING"].includes(r.status),
    ).length;
    return { submitted, checked, pending, total: data.recipients.length };
  }, [data.recipients]);

  const isDeadlinePast = data.deadline && new Date(data.deadline) < new Date();

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link
          href="/dashboard/teacher/homework"
          className="transition-colors hover:text-gray-600"
        >
          Домашние задания
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-600 line-clamp-1 max-w-[300px]">{data.title}</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${HW_STATUS_STYLE[data.status]}`}
              >
                {HW_STATUS_LABEL[data.status]}
              </span>
              {data.classroomName && (
                <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {data.classroomName}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
            {data.description && (
              <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
                {data.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-gray-400" />
                <span className={isDeadlinePast ? "font-medium text-red-600" : ""}>
                  {formatDeadline(data.deadline)}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-gray-400" />
                {data.taskCount} задач
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-400" />
                {data.recipients.length} учеников
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/teacher/reviews"
            className="ml-4 flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            Все работы
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <StatCard
          label="Всего учеников"
          value={stats.total}
          icon={<Users className="h-4 w-4" />}
          delay={0.1}
        />
        <StatCard
          label="Сдали работу"
          value={stats.submitted}
          total={stats.total}
          icon={<BookOpen className="h-4 w-4" />}
          delay={0.15}
        />
        <StatCard
          label="Проверено"
          value={stats.checked}
          total={stats.submitted}
          icon={<CheckCircle2 className="h-4 w-4" />}
          delay={0.2}
        />
        <StatCard
          label="Ждут проверки"
          value={stats.pending}
          icon={<AlertCircle className="h-4 w-4" />}
          highlight
          delay={0.25}
        />
      </div>

      {/* Recipients */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Ученики</h2>
        </div>

        {data.recipients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <Users className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">Нет назначенных учеников</p>
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
                    Статус
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-400">
                    Сдано
                  </th>
                  <th className="py-3 text-left text-xs font-medium text-gray-400">
                    Балл
                  </th>
                  <th className="py-3 pr-6 text-left text-xs font-medium text-gray-400">
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recipients.map((rec, index) => {
                  const isLast = index === data.recipients.length - 1;
                  const canReview =
                    rec.status === "SUBMITTED" || rec.status === "CHECKING";
                  const isChecked =
                    rec.status === "CHECKED" || rec.status === "RETURNED";

                  return (
                    <motion.tr
                      key={rec.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.35 + index * 0.04 }}
                      className={`transition-colors hover:bg-gray-50 ${
                        !isLast ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-6">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {getInitials(rec.student.name)}
                          </div>
                          <span className="text-[15px] font-medium text-gray-800">
                            {rec.student.name ?? "Ученик"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium ${REC_STATUS_STYLE[rec.status]}`}
                        >
                          {REC_STATUS_LABEL[rec.status]}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatSubmittedAt(rec.submittedAt)}
                        </div>
                      </td>
                      <td className="py-3.5">
                        {isChecked && rec.scorePercent !== null ? (
                          <span className="text-sm font-semibold text-emerald-700">
                            {Math.round(rec.scorePercent)}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-6">
                        {canReview && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg border-gray-200 text-xs font-medium text-gray-700 transition-all hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          >
                            <Link href={`/dashboard/teacher/review/${rec.id}`}>
                              Проверить
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                        {isChecked && (
                          <Link
                            href={`/dashboard/teacher/review/${rec.id}`}
                            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600"
                          >
                            Просмотреть
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
