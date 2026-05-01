"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionTask } from "../_lib/getHomeworkSession";

interface Part1TaskCardProps {
  task: SessionTask;
  taskIndex: number;
  totalTasks: number;
  localResult: "CORRECT" | "WRONG" | "PENDING" | "PARTIAL" | null;
  localScore: number | null;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (homeworkTaskId: string, answer: string) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
}

export const Part1TaskCard = ({
  task,
  taskIndex,
  totalTasks,
  localResult,
  localScore,
  isReadOnly,
  saving,
  onSave,
  onPrev,
  onNext,
}: Part1TaskCardProps) => {
  const savedAnswer = task.answer?.answer ?? "";
  const [inputValue, setInputValue] = useState(savedAnswer);

  const displayResult = localResult ?? task.answer?.result ?? null;
  const displayScore = localScore ?? task.answer?.score ?? null;

  const isAnswered = displayResult === "CORRECT" || displayResult === "WRONG";
  const hasChanged = inputValue.trim() !== savedAnswer.trim();

  const handleSubmit = async () => {
    if (!inputValue.trim() || saving) return;
    await onSave(task.homeworkTaskId, inputValue.trim());
  };

  return (
    <div className="flex h-full flex-col">
      {/* Task header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              Задание {task.examNumber}
            </span>
            <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              Часть 1 · Краткий ответ
            </span>
            <span className="text-xs text-gray-400">{task.points} б.</span>
          </div>
          <p className="text-sm font-medium text-gray-500">{task.topicTitle}</p>
        </div>

        {/* Navigation */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onPrev}
            disabled={taskIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[48px] text-center text-xs text-gray-400">
            {taskIndex + 1} / {totalTasks}
          </span>
          <button
            onClick={onNext}
            disabled={taskIndex === totalTasks - 1}
            className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task image */}
      {task.imageUrl && (
        <div className="mb-5 overflow-hidden rounded border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.imageUrl}
            alt="Условие задачи"
            className="max-h-72 w-full object-contain"
          />
        </div>
      )}

      {/* Task condition */}
      <div className="mb-6 flex-1 rounded border border-gray-200 bg-gray-50 p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {task.condition}
        </p>
      </div>

      {/* Answer block */}
      {isReadOnly ? (
        <div className="rounded border border-gray-200 p-5">
          <p className="mb-2 text-xs font-medium text-gray-500">Ваш ответ</p>
          <p className="text-sm font-semibold text-gray-800">
            {task.answer?.answer ?? "Нет ответа"}
          </p>

          {displayResult && (
            <div
              className={cn(
                "mt-3 flex items-center gap-2 rounded px-4 py-2.5",
                displayResult === "CORRECT"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600",
              )}
            >
              {displayResult === "CORRECT" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">
                {displayResult === "CORRECT" ? "Верно!" : "Неверно"}
              </span>
              {displayScore !== null && (
                <span className="ml-auto text-sm font-bold">
                  {displayScore} / {task.points} б.
                </span>
              )}
            </div>
          )}

          {task.correctAnswer && (
            <div className="mt-3 rounded bg-gray-50 px-4 py-2.5 border border-gray-200">
              <p className="text-xs text-gray-500">Правильный ответ</p>
              <p className="mt-0.5 font-semibold text-gray-800">{task.correctAnswer}</p>
            </div>
          )}

          {task.answer?.teacherComment && (
            <div className="mt-3 rounded bg-amber-50 border border-amber-200 px-4 py-2.5">
              <p className="text-xs text-amber-600">Комментарий преподавателя</p>
              <p className="mt-0.5 text-sm text-amber-800">{task.answer.teacherComment}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded border border-gray-200 p-5">
          {isAnswered && (
            <div
              className={cn(
                "mb-4 flex items-center gap-2 rounded px-4 py-2.5",
                displayResult === "CORRECT"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600",
              )}
            >
              {displayResult === "CORRECT" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm font-semibold">
                {displayResult === "CORRECT" ? "Верно!" : "Неверно, попробуйте ещё раз"}
              </span>
              {displayScore !== null && (
                <span className="ml-auto text-sm font-bold">
                  {displayScore} / {task.points} б.
                </span>
              )}
            </div>
          )}

          <label className="mb-2 block text-xs font-medium text-gray-500">
            Краткий ответ
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Введите ответ"
              className="h-11 flex-1 rounded border border-gray-200 bg-white px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || saving}
              className={cn(
                "flex h-11 items-center gap-2 rounded px-5 text-sm font-semibold transition-all",
                inputValue.trim() && !saving
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "cursor-not-allowed bg-gray-100 text-gray-400",
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isAnswered && !hasChanged ? (
                "Проверено"
              ) : (
                "Проверить"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
