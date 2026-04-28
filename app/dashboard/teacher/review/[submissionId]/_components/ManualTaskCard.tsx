"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { FileViewer } from "./FileViewer";
import type { ReviewTaskItem } from "../_lib/getReviewData";

interface ManualTaskCardProps {
  task: ReviewTaskItem;
  score: number | null;
  comment: string;
  onChange: (score: number | null, comment: string) => void;
  index: number;
}

function pluralizePoints(n: number): string {
  if (n === 1) return "балл";
  if (n >= 2 && n <= 4) return "балла";
  return "баллов";
}

function parseFileUrls(fileUrl: string | null): string[] {
  if (!fileUrl) return [];
  try {
    const parsed = JSON.parse(fileUrl);
    if (Array.isArray(parsed)) return parsed as string[];
    return [fileUrl];
  } catch {
    return [fileUrl];
  }
}

export const ManualTaskCard = ({
  task,
  score,
  comment,
  onChange,
  index,
}: ManualTaskCardProps) => {
  const maxScore = Math.round(task.maxPoints);
  const scoreButtons = Array.from({ length: maxScore + 1 }, (_, i) => i);
  const isChecked = score !== null;

  const fileUrls = parseFileUrls(task.answer?.fileUrl ?? null);
  const studentComment = task.answer?.answer ?? null;
  const hasNoContent = task.answer && fileUrls.length === 0 && !studentComment;
  const notSubmitted = !task.answer;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
            {task.examNumber}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{task.topicTitle}</p>
            {task.title && (
              <p className="line-clamp-1 text-xs text-gray-400">{task.title}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            Макс. {maxScore} {pluralizePoints(maxScore)}
          </span>
          {isChecked ? (
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Проверено · {score} / {maxScore}
            </span>
          ) : (
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600">
              Не проверено
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] divide-x divide-gray-100">
        {/* Left: task condition + student answer */}
        <div className="p-5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Условие задачи
          </p>
          <p className="mb-4 text-sm leading-relaxed text-gray-700 line-clamp-4">
            {task.condition}
          </p>

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            Решение ученика
          </p>

          {notSubmitted && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Ученик не сдал это задание
            </div>
          )}

          {hasNoContent && (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Файл не прикреплён и комментарий не оставлен
            </div>
          )}

          {task.answer && (
            <FileViewer
              fileUrls={fileUrls}
              studentComment={studentComment}
              taskNumber={task.examNumber}
            />
          )}
        </div>

        {/* Right: scoring */}
        <div className="flex flex-col gap-4 p-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Балл
            </p>
            <div className="flex flex-wrap gap-1.5">
              {scoreButtons.map((s) => (
                <button
                  key={s}
                  onClick={() => onChange(s, comment)}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    score === s
                      ? s === 0
                        ? "bg-red-500 text-white shadow-sm"
                        : s === maxScore
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Комментарий для ученика
            </p>
            <textarea
              value={comment}
              onChange={(e) => onChange(score, e.target.value)}
              placeholder="Комментарий к решению..."
              rows={5}
              className="w-full flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:bg-white"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
