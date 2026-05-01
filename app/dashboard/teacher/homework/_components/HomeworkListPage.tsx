"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ClipboardList, ArrowRight, Clock, Users, BookOpen, AlertCircle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeacherHomeworkItem } from "../_lib/getTeacherHomeworkList";
import type { HomeworkStatus } from "@/lib/generated/prisma/enums";

type Tab = "all" | "draft" | "published" | "closed";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "published", label: "Активные" },
  { id: "draft", label: "Черновики" },
  { id: "closed", label: "Завершённые" },
];

const STATUS_LABEL: Record<HomeworkStatus, string> = {
  DRAFT: "Черновик",
  PUBLISHED: "Активно",
  CLOSED: "Завершено",
  ARCHIVED: "В архиве",
};

const STATUS_STYLE: Record<HomeworkStatus, string> = {
  DRAFT: "border border-gray-300 text-gray-500",
  PUBLISHED: "border border-gray-800 text-gray-800",
  CLOSED: "border border-gray-200 text-gray-400",
  ARCHIVED: "border border-gray-200 text-gray-400",
};

function formatDeadline(date: Date | null): string {
  if (!date) return "Без дедлайна";
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
  const time = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diff < 0) return `Просрочен · ${formatted}`;
  if (days === 0) return `Сегодня, ${time}`;
  if (days === 1) return `Завтра, ${time}`;
  return `${formatted}, ${time}`;
}

function deadlineUrgency(date: Date | null): "overdue" | "soon" | "normal" | "none" {
  if (!date) return "none";
  const diff = date.getTime() - Date.now();
  if (diff < 0) return "overdue";
  if (diff < 2 * 24 * 60 * 60 * 1000) return "soon";
  return "normal";
}

interface HomeworkListPageProps {
  homeworks: TeacherHomeworkItem[];
}

export const HomeworkListPage = ({ homeworks }: HomeworkListPageProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return homeworks;
    if (activeTab === "draft") return homeworks.filter((h) => h.status === "DRAFT");
    if (activeTab === "published") return homeworks.filter((h) => h.status === "PUBLISHED");
    return homeworks.filter((h) => h.status === "CLOSED" || h.status === "ARCHIVED");
  }, [homeworks, activeTab]);

  const counts = useMemo(() => ({
    all: homeworks.length,
    published: homeworks.filter((h) => h.status === "PUBLISHED").length,
    draft: homeworks.filter((h) => h.status === "DRAFT").length,
    closed: homeworks.filter((h) => h.status === "CLOSED" || h.status === "ARCHIVED").length,
  }), [homeworks]);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Домашние задания</h1>
          <p className="mt-1.5 text-lg text-gray-500">
            {homeworks.length > 0
              ? `${homeworks.length} заданий · ${counts.published} активных`
              : "Создайте первое домашнее задание"}
          </p>
        </div>
        <Button
          asChild
          className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
        >
          <Link href="/dashboard/teacher/homework/create">
            <Plus className="h-4 w-4" />
            Создать ДЗ
          </Link>
        </Button>
      </motion.div>

      <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-medium transition-all ${
              activeTab === id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
            <span
              className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                activeTab === id
                  ? "bg-white/15 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {counts[id]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <ClipboardList className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-600">
              {activeTab === "all" ? "Заданий пока нет" : "Нет заданий в этой категории"}
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {activeTab === "all"
                ? "Создайте первое домашнее задание для своих учеников"
                : "Попробуйте выбрать другую вкладку"}
            </p>
          </div>
          {activeTab === "all" && (
            <Button
              asChild
              className="mt-2 gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              <Link href="/dashboard/teacher/homework/create">
                <Plus className="h-4 w-4" />
                Создать первое ДЗ
              </Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((hw, index) => {
            const urgency = deadlineUrgency(hw.deadline);
            const progress =
              hw.recipientCount > 0
                ? Math.round((hw.submittedCount / hw.recipientCount) * 100)
                : 0;

            return (
              <motion.div
                key={hw.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[hw.status]}`}
                      >
                        {STATUS_LABEL[hw.status]}
                      </span>
                      {hw.classroomName ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
                          <School className="h-3 w-3 text-gray-400" />
                          {hw.classroomName}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Индивидуально
                        </span>
                      )}
                      {hw.pendingReviews > 0 && (
                        <span className="flex items-center gap-1 rounded-lg border border-gray-700 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                          <AlertCircle className="h-3 w-3" />
                          {hw.pendingReviews} на проверке
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 text-xl font-semibold text-gray-900">
                      {hw.title}
                    </h3>
                    {hw.description && (
                      <p className="mt-1 line-clamp-1 text-base text-gray-400">
                        {hw.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-base text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock
                          className={`h-4 w-4 ${
                            urgency === "overdue"
                              ? "text-red-400"
                              : urgency === "soon"
                                ? "text-orange-400"
                                : "text-gray-400"
                          }`}
                        />
                        <span
                          className={
                            urgency === "overdue"
                              ? "font-medium text-red-600"
                              : urgency === "soon"
                                ? "font-medium text-orange-600"
                                : ""
                          }
                        >
                          {formatDeadline(hw.deadline)}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        {hw.submittedCount} / {hw.recipientCount} сдали
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        {hw.taskCount} задач
                      </span>
                    </div>

                    {hw.recipientCount > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            className="h-full rounded-full bg-gray-700"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{
                              duration: 0.6,
                              delay: 0.2 + index * 0.05,
                              ease: "easeOut",
                            }}
                          />
                        </div>
                        <span className="shrink-0 text-xs font-medium text-gray-500">
                          {progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/teacher/homework/${hw.id}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-base font-medium text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Открыть
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
