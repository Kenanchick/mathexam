"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, User, BookOpen, Clock } from "lucide-react";
import { AutoCheckedTasksTable } from "./AutoCheckedTasksTable";
import { ManualTaskCard } from "./ManualTaskCard";
import { ReviewSummaryPanel } from "./ReviewSummaryPanel";
import { saveReview } from "../_actions/saveReview";
import type { ReviewData } from "../_lib/getReviewData";
import { convertPrimaryToTestScore } from "../_lib/egeScoring";
import type { HomeworkRecipientStatus } from "@/lib/generated/prisma/enums";

type TaskScoreState = { score: number | null; comment: string };

const STATUS_LABEL: Record<HomeworkRecipientStatus, string> = {
  ASSIGNED: "Назначено",
  IN_PROGRESS: "В работе",
  SUBMITTED: "На проверке",
  CHECKING: "Проверяется",
  CHECKED: "Проверено",
  RETURNED: "Возвращено",
  OVERDUE: "Просрочено",
};

const STATUS_STYLE: Record<HomeworkRecipientStatus, string> = {
  ASSIGNED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  SUBMITTED: "bg-orange-50 text-orange-600",
  CHECKING: "bg-yellow-50 text-yellow-700",
  CHECKED: "bg-emerald-50 text-emerald-700",
  RETURNED: "bg-purple-50 text-purple-700",
  OVERDUE: "bg-red-50 text-red-600",
};

interface SummaryCardProps {
  label: string;
  value: string;
  sublabel: string;
  color: "blue" | "orange" | "emerald" | "purple";
  delay: number;
}

const COLOR_CLASSES: Record<SummaryCardProps["color"], string> = {
  blue: "border-teal-100 bg-teal-50 text-teal-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  purple: "border-green-200 bg-green-50 text-green-800",
};

const SummaryCard = ({ label, value, sublabel, color, delay }: SummaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className={`rounded-2xl border p-4 ${COLOR_CLASSES[color]}`}
  >
    <p className="text-xs font-medium opacity-70">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value}</p>
    <p className="mt-0.5 text-xs opacity-70">{sublabel}</p>
  </motion.div>
);

interface ReviewPageProps {
  data: ReviewData;
}

export const ReviewPage = ({ data }: ReviewPageProps) => {
  const [taskScores, setTaskScores] = useState<Record<string, TaskScoreState>>(() => {
    const init: Record<string, TaskScoreState> = {};
    for (const task of data.tasks) {
      if (task.examNumber >= 13) {
        init[task.homeworkTaskId] = {
          score: task.answer?.score ?? null,
          comment: task.answer?.teacherComment ?? "",
        };
      }
    }
    return init;
  });
  const [overallComment, setOverallComment] = useState(data.teacherComment ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const part1Tasks = useMemo(
    () => data.tasks.filter((t) => t.examNumber <= 12),
    [data.tasks],
  );
  const part2Tasks = useMemo(
    () => data.tasks.filter((t) => t.examNumber >= 13),
    [data.tasks],
  );

  const part1Score = useMemo(
    () => part1Tasks.reduce((sum, t) => sum + (t.answer?.result === "CORRECT" ? 1 : 0), 0),
    [part1Tasks],
  );
  const part2Score = useMemo(
    () =>
      part2Tasks.reduce(
        (sum, t) => sum + (taskScores[t.homeworkTaskId]?.score ?? 0),
        0,
      ),
    [part2Tasks, taskScores],
  );

  const part1Max = part1Tasks.reduce((sum, t) => sum + t.maxPoints, 0);
  const part2Max = part2Tasks.reduce((sum, t) => sum + t.maxPoints, 0);
  const totalPrimary = part1Score + part2Score;

  const uncheckedCount = part2Tasks.filter(
    (t) => taskScores[t.homeworkTaskId]?.score === null,
  ).length;

  const updateTaskScore = useCallback(
    (homeworkTaskId: string, score: number | null, comment: string) => {
      setTaskScores((prev) => ({ ...prev, [homeworkTaskId]: { score, comment } }));
    },
    [],
  );

  const handleSave = async (submit: boolean) => {
    setSaveStatus("saving");
    const result = await saveReview({
      submissionId: data.submissionId,
      taskScores: part2Tasks.map((t) => ({
        homeworkTaskId: t.homeworkTaskId,
        score: taskScores[t.homeworkTaskId]?.score ?? 0,
        comment: taskScores[t.homeworkTaskId]?.comment ?? "",
      })),
      overallComment,
      submit,
    });

    if (result.success) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } else {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const submittedAtFormatted = data.submittedAt
    ? new Date(data.submittedAt).toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Дата неизвестна";

  const cardCols = data.homework.isVariant ? "grid-cols-4" : "grid-cols-3";
  const part1Correct = part1Tasks.filter((t) => t.answer?.result === "CORRECT").length;
  const testScore = convertPrimaryToTestScore(totalPrimary);

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
        <Link
          href={`/dashboard/teacher/homework/${data.homework.id}`}
          className="transition-colors hover:text-gray-600"
        >
          {data.homework.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-600">Проверка работы</span>
      </nav>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start gap-3 mb-1">
          <span
            className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[data.status]}`}
          >
            {STATUS_LABEL[data.status]}
          </span>
          {data.homework.classroomName && (
            <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {data.homework.classroomName}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Проверка работы</h1>
        <div className="mt-2 flex flex-wrap items-center gap-5 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4 text-gray-400" />
            {data.student.name ?? "Ученик"}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-gray-400" />
            {data.homework.title}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-gray-400" />
            Сдано: {submittedAtFormatted}
          </span>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className={`mb-6 grid gap-3 ${cardCols}`}>
        <SummaryCard
          label="Автопроверка"
          value={`${part1Correct} / ${part1Tasks.length}`}
          sublabel="задания 1–12"
          color="blue"
          delay={0.1}
        />
        <SummaryCard
          label="Ручная проверка"
          value={`${part2Tasks.length}`}
          sublabel={
            uncheckedCount > 0
              ? `${uncheckedCount} не проверено`
              : part2Tasks.length > 0
                ? "все проверены"
                : "нет заданий"
          }
          color={uncheckedCount > 0 ? "orange" : "emerald"}
          delay={0.15}
        />
        <SummaryCard
          label="Первичный балл"
          value={`${totalPrimary} / ${part1Max + part2Max}`}
          sublabel="из всех заданий"
          color="purple"
          delay={0.2}
        />
        {data.homework.isVariant && (
          <SummaryCard
            label="Тестовый балл ЕГЭ"
            value={`${testScore}`}
            sublabel="из 100"
            color="emerald"
            delay={0.25}
          />
        )}
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-[1fr_320px] items-start gap-6">
        <div className="flex flex-col gap-6">
          {part1Tasks.length > 0 && <AutoCheckedTasksTable tasks={part1Tasks} />}

          {part2Tasks.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Часть 2 — ручная проверка
              </h2>
              {part2Tasks.map((task, i) => (
                <ManualTaskCard
                  key={task.homeworkTaskId}
                  task={task}
                  score={taskScores[task.homeworkTaskId]?.score ?? null}
                  comment={taskScores[task.homeworkTaskId]?.comment ?? ""}
                  onChange={(score, comment) =>
                    updateTaskScore(task.homeworkTaskId, score, comment)
                  }
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        <ReviewSummaryPanel
          part1Score={part1Score}
          part1Max={part1Max}
          part2Score={part2Score}
          part2Max={part2Max}
          isVariant={data.homework.isVariant}
          overallComment={overallComment}
          onCommentChange={setOverallComment}
          canSubmit={uncheckedCount === 0}
          onSaveDraft={() => handleSave(false)}
          onSubmit={() => handleSave(true)}
          saveStatus={saveStatus}
          uncheckedCount={uncheckedCount}
        />
      </div>
    </div>
  );
};
