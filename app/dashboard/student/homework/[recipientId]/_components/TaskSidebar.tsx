"use client";

import { CheckCircle2, XCircle, Clock, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionTask } from "../_lib/getHomeworkSession";

interface TaskSidebarProps {
  tasks: SessionTask[];
  currentIndex: number;
  localResults: Record<string, "CORRECT" | "WRONG" | "PENDING" | "PARTIAL" | null>;
  onSelect: (index: number) => void;
  progressPercent: number;
  answeredCount: number;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  isReadOnly: boolean;
  scorePercent: number | null;
}

function getTaskIcon(
  task: SessionTask,
  localResult: "CORRECT" | "WRONG" | "PENDING" | "PARTIAL" | null,
) {
  const result = localResult ?? task.answer?.result ?? null;

  if (result === "CORRECT") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
  }
  if (result === "WRONG") {
    return <XCircle className="h-3.5 w-3.5 text-red-400" />;
  }
  if (result === "PENDING" && task.answer?.submittedAt) {
    return <Clock className="h-3.5 w-3.5 text-amber-400" />;
  }
  if (task.examNumber >= 13 && task.answer?.fileUrl) {
    return <FileText className="h-3.5 w-3.5 text-gray-400" />;
  }
  return null;
}

export const TaskSidebar = ({
  tasks,
  currentIndex,
  localResults,
  onSelect,
  progressPercent,
  answeredCount,
  canSubmit,
  submitting,
  onSubmit,
  isReadOnly,
  scorePercent,
}: TaskSidebarProps) => {
  return (
    <aside className="flex h-full flex-col">
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-gray-500">
          <span>Прогресс</span>
          <span className="font-semibold text-gray-700">
            {answeredCount} / {tasks.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-sm bg-gray-100">
          <div
            className="h-full bg-gray-900 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {tasks.map((task, index) => {
          const icon = getTaskIcon(task, localResults[task.homeworkTaskId] ?? null);
          const isActive = index === currentIndex;
          const isPartTwo = task.examNumber >= 13;

          return (
            <button
              key={task.homeworkTaskId}
              onClick={() => onSelect(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-left transition-all",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600",
                )}
              >
                {task.examNumber}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{task.topicTitle}</p>
                <p className="text-[10px] text-gray-400">
                  {isPartTwo ? "Часть 2" : "Часть 1"} · {task.points} б.
                </p>
              </div>

              <span className="shrink-0">{icon}</span>
            </button>
          );
        })}
      </div>

      {!isReadOnly && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          {scorePercent !== null ? (
            <div className="rounded bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-500">Итоговый балл</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(scorePercent)}%
              </p>
            </div>
          ) : (
            <button
              onClick={onSubmit}
              disabled={submitting || !canSubmit}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded px-4 py-2.5 text-sm font-semibold transition-all",
                canSubmit && !submitting
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "cursor-not-allowed bg-gray-100 text-gray-400",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Сдаём...
                </>
              ) : (
                "Сдать работу"
              )}
            </button>
          )}
          {!canSubmit && !submitting && scorePercent === null && (
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Ответьте хотя бы на одну задачу
            </p>
          )}
        </div>
      )}
    </aside>
  );
};
