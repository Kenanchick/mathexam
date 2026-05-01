"use client";

import { AlertCircle, Users, BookOpen, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecipientMode } from "./HomeworkRecipients";
import type { TaskSource } from "./HomeworkTaskSourceSelector";

const RECIPIENT_MODE_LABEL: Record<RecipientMode, string> = {
  all: "Весь класс",
  selected: "Выбранные ученики",
  personal: "Лично выбранным",
};

const TASK_SOURCE_LABEL: Record<TaskSource, string> = {
  manual: "Ручной выбор",
  variant: "Готовый вариант",
  constructor: "Конструктор ЕГЭ",
};

interface HomeworkSummaryProps {
  title: string;
  classroomName: string | null;
  recipientMode: RecipientMode;
  recipientCount: number;
  taskCount: number;
  deadlineDate: string;
  deadlineTime: string;
  taskSource: TaskSource;
  warnings: string[];
  canPublish: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
  isSaving: boolean;
}

function formatDeadline(date: string, time: string): string {
  if (!date) return "не указан";
  const d = new Date(`${date}T${time || "00:00"}`);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const HomeworkSummary = ({
  title,
  classroomName,
  recipientMode,
  recipientCount,
  taskCount,
  deadlineDate,
  deadlineTime,
  taskSource,
  warnings,
  canPublish,
  onSaveDraft,
  onPublish,
  isSaving,
}: HomeworkSummaryProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Итог задания
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Название
          </p>
          <p className="mt-1 text-sm font-medium text-gray-800">
            {title || <span className="text-gray-300">не указано</span>}
          </p>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="flex items-center gap-2.5">
          <Layers className="h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Класс</p>
            <p className="text-sm font-medium text-gray-800">
              {classroomName ?? (
                <span className="text-gray-300">
                  {recipientMode === "personal" ? "без класса" : "не выбран"}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">
              {RECIPIENT_MODE_LABEL[recipientMode]}
            </p>
            <p className="text-sm font-medium text-gray-800">
              {recipientCount > 0 ? (
                `${recipientCount} ${pluralStudents(recipientCount)}`
              ) : (
                <span className="text-gray-300">0 учеников</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">
              {TASK_SOURCE_LABEL[taskSource]}
            </p>
            <p className="text-sm font-medium text-gray-800">
              {taskCount > 0 ? (
                `${taskCount} ${pluralTasks(taskCount)}`
              ) : (
                <span className="text-gray-300">задачи не добавлены</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-400">Дедлайн</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDeadline(deadlineDate, deadlineTime)}
            </p>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-5 space-y-1.5 rounded-xl border border-gray-300 bg-gray-50 p-3">
          {warnings.map((w) => (
            <div key={w} className="flex items-center gap-2 text-xs text-gray-700">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-2">
        <Button
          type="button"
          onClick={onPublish}
          disabled={!canPublish || isSaving}
          className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? "Публикация..." : "Опубликовать"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full rounded-xl"
        >
          {isSaving ? "Сохранение..." : "Сохранить черновик"}
        </Button>
      </div>
    </div>
  );
};

function pluralStudents(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "ученик";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "ученика";
  return "учеников";
}

function pluralTasks(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "задача";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "задачи";
  return "задач";
}
