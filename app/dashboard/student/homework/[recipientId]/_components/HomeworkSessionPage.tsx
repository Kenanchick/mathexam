"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { saveAnswer } from "../_actions/saveAnswer";
import { submitHomework } from "../_actions/submitHomework";
import { TaskSidebar } from "./TaskSidebar";
import { Part1TaskCard } from "./Part1TaskCard";
import { Part2TaskCard } from "./Part2TaskCard";
import type { HomeworkSession } from "../_lib/getHomeworkSession";

const STATUS_LABEL: Record<HomeworkSession["status"], string> = {
  ASSIGNED: "Новое",
  IN_PROGRESS: "В процессе",
  SUBMITTED: "Сдано",
  CHECKING: "На проверке",
  CHECKED: "Проверено",
  RETURNED: "Возвращено",
  OVERDUE: "Просрочено",
};

const STATUS_STYLE: Record<HomeworkSession["status"], string> = {
  ASSIGNED: "border border-gray-200 bg-gray-50 text-gray-600",
  IN_PROGRESS: "border border-gray-200 bg-gray-50 text-gray-600",
  SUBMITTED: "border border-gray-200 bg-gray-50 text-gray-600",
  CHECKING: "border border-gray-200 bg-gray-50 text-gray-600",
  CHECKED: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  RETURNED: "border border-amber-200 bg-amber-50 text-amber-700",
  OVERDUE: "border border-red-200 bg-red-50 text-red-600",
};

function formatDeadline(date: Date | null): string {
  if (!date) return "Без дедлайна";
  const d = new Date(date);
  const isPast = d < new Date();
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return isPast ? `${formatted} (просрочено)` : `до ${formatted}`;
}

interface Props {
  session: HomeworkSession;
}

export const HomeworkSessionPage = ({ session }: Props) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Local result state for immediate feedback after save
  const [localResults, setLocalResults] = useState<
    Record<string, "CORRECT" | "WRONG" | "PENDING" | "PARTIAL" | null>
  >({});
  const [localScores, setLocalScores] = useState<Record<string, number | null>>({});

  const isReadOnly = !["ASSIGNED", "IN_PROGRESS", "RETURNED"].includes(
    session.status,
  );

  const answeredCount = session.tasks.filter(
    (t) =>
      (t.answer?.submittedAt != null) ||
      (t.answer?.checkedAt != null),
  ).length;

  const canSubmit = answeredCount > 0 && !isReadOnly;

  const handleSavePart1 = useCallback(
    async (homeworkTaskId: string, answer: string) => {
      setSaving(true);
      const res = await saveAnswer({
        recipientId: session.recipientId,
        homeworkTaskId,
        answer,
        fileUrls: [],
      });
      if (res.success) {
        setLocalResults((prev) => ({
          ...prev,
          [homeworkTaskId]: res.result ?? null,
        }));
        setLocalScores((prev) => ({
          ...prev,
          [homeworkTaskId]: res.score ?? null,
        }));
        router.refresh();
      }
      setSaving(false);
    },
    [session.recipientId, router],
  );

  const handleSavePart2 = useCallback(
    async (homeworkTaskId: string, comment: string, fileUrls: string[]) => {
      setSaving(true);
      const res = await saveAnswer({
        recipientId: session.recipientId,
        homeworkTaskId,
        answer: comment || null,
        fileUrls,
      });
      if (res.success) {
        setLocalResults((prev) => ({
          ...prev,
          [homeworkTaskId]: "PENDING",
        }));
        router.refresh();
      }
      setSaving(false);
    },
    [session.recipientId, router],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    const res = await submitHomework({ recipientId: session.recipientId });
    if (res.success) {
      router.refresh();
    } else {
      setSubmitError(res.error);
    }
    setSubmitting(false);
  }, [session.recipientId, router]);

  const currentTask = session.tasks[currentIndex];
  const deadlineIsPast =
    session.deadline && new Date(session.deadline) < new Date();

  const progressPercent =
    session.tasks.length > 0
      ? (answeredCount / session.tasks.length) * 100
      : 0;

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-gray-400">
        <Link
          href="/dashboard/student/homework"
          className="transition-colors hover:text-gray-600"
        >
          Домашние задания
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 max-w-[300px] text-gray-600">
          {session.title}
        </span>
      </nav>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mb-5 rounded border border-gray-200 bg-white px-6 py-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded px-2.5 py-0.5 text-xs font-medium",
                  STATUS_STYLE[session.status],
                )}
              >
                {STATUS_LABEL[session.status]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{session.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gray-400" />
              {session.teacherName}
            </span>
            <span
              className={cn(
                "flex items-center gap-1.5",
                deadlineIsPast && !isReadOnly ? "font-medium text-red-500" : "",
              )}
            >
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {formatDeadline(session.deadline)}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-gray-400" />
              {answeredCount} / {session.tasks.length} задач
            </span>
          </div>
        </div>
      </motion.div>

      {/* Teacher description / task instructions */}
      {session.description && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-5 rounded border border-gray-200 bg-gray-50 px-5 py-4"
        >
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Комментарий преподавателя
          </p>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {session.description}
          </p>
        </motion.div>
      )}

      {/* Result banner for checked homework */}
      {(session.status === "CHECKED" || session.status === "RETURNED") &&
        session.scorePercent !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mb-5 rounded border px-6 py-4",
              session.status === "CHECKED"
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded text-xl font-bold",
                  session.status === "CHECKED"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                {Math.round(session.scorePercent)}%
              </div>
              <div>
                <p
                  className={cn(
                    "text-base font-bold",
                    session.status === "CHECKED"
                      ? "text-emerald-800"
                      : "text-amber-800",
                  )}
                >
                  {session.status === "CHECKED"
                    ? "Работа проверена"
                    : "Работа возвращена на доработку"}
                </p>
                {session.teacherComment && (
                  <p
                    className={cn(
                      "mt-0.5 text-sm",
                      session.status === "CHECKED"
                        ? "text-emerald-700"
                        : "text-amber-700",
                    )}
                  >
                    {session.teacherComment}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

      {/* Submitted banner */}
      {(session.status === "SUBMITTED" || session.status === "CHECKING") && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-5 py-4"
        >
          <Clock className="h-5 w-5 shrink-0 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Работа сдана. Ожидает проверки преподавателем.
          </p>
        </motion.div>
      )}

      {/* Returned banner */}
      {session.status === "RETURNED" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex items-center gap-3 rounded border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <RotateCcw className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              Работа возвращена на доработку.
            </p>
            {session.teacherComment && (
              <p className="mt-0.5 text-xs text-amber-600">
                {session.teacherComment}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Main 2-column layout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="grid grid-cols-[260px_1fr] gap-5"
      >
        {/* Left sidebar */}
        <div className="rounded border border-gray-200 bg-white p-4">
          <TaskSidebar
            tasks={session.tasks}
            currentIndex={currentIndex}
            localResults={localResults}
            onSelect={setCurrentIndex}
            progressPercent={progressPercent}
            answeredCount={answeredCount}
            canSubmit={canSubmit}
            submitting={submitting}
            onSubmit={handleSubmit}
            isReadOnly={isReadOnly}
            scorePercent={session.scorePercent}
          />
          {submitError && (
            <p className="mt-2 text-center text-xs text-red-500">{submitError}</p>
          )}
        </div>

        {/* Task content */}
        <div className="min-h-[500px] rounded border border-gray-200 bg-white p-6">
          {currentTask ? (
            currentTask.examNumber <= 12 ? (
              <Part1TaskCard
                key={currentTask.homeworkTaskId}
                task={currentTask}
                taskIndex={currentIndex}
                totalTasks={session.tasks.length}
                localResult={localResults[currentTask.homeworkTaskId] ?? null}
                localScore={localScores[currentTask.homeworkTaskId] ?? null}
                isReadOnly={isReadOnly}
                saving={saving}
                onSave={handleSavePart1}
                onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                onNext={() =>
                  setCurrentIndex((i) => Math.min(session.tasks.length - 1, i + 1))
                }
              />
            ) : (
              <Part2TaskCard
                key={currentTask.homeworkTaskId}
                task={currentTask}
                taskIndex={currentIndex}
                totalTasks={session.tasks.length}
                isReadOnly={isReadOnly}
                saving={saving}
                onSave={handleSavePart2}
                onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                onNext={() =>
                  setCurrentIndex((i) => Math.min(session.tasks.length - 1, i + 1))
                }
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              Нет задач
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
