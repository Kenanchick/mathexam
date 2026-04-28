"use client";

import { ListChecks, BookMarked, LayoutGrid } from "lucide-react";
import { ManualTaskPicker } from "./ManualTaskPicker";
import { ExamVariantPicker } from "./ExamVariantPicker";
import { ExamConstructor } from "./ExamConstructor";
import type { TaskForPicker, TopicOption } from "../_lib/getCreateHomeworkData";

export type TaskSource = "manual" | "variant" | "constructor";

const SOURCES = [
  {
    id: "manual" as const,
    label: "Вручную",
    description: "Выбрать задачи из банка",
    icon: ListChecks,
  },
  {
    id: "variant" as const,
    label: "Готовый вариант",
    description: "Использовать вариант ЕГЭ",
    icon: BookMarked,
  },
  {
    id: "constructor" as const,
    label: "Собрать вариант",
    description: "Задания 1–19 по слотам",
    icon: LayoutGrid,
  },
];

interface HomeworkTaskSourceSelectorProps {
  source: TaskSource;
  tasks: TaskForPicker[];
  topics: TopicOption[];
  selectedTaskIds: string[];
  constructorSlots: Record<number, string | null>;
  onSourceChange: (s: TaskSource) => void;
  onTaskToggle: (id: string) => void;
  onSlotChange: (examNumber: number, taskId: string | null) => void;
}

export const HomeworkTaskSourceSelector = ({
  source,
  tasks,
  topics,
  selectedTaskIds,
  constructorSlots,
  onSourceChange,
  onTaskToggle,
  onSlotChange,
}: HomeworkTaskSourceSelectorProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Как составить задание
      </h2>

      <div className="mb-5 grid grid-cols-3 gap-3">
        {SOURCES.map(({ id, label, description, icon: Icon }) => {
          const active = source === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSourceChange(id)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400"}`}
              />
              <span
                className={`text-sm font-semibold ${active ? "text-blue-800" : "text-gray-700"}`}
              >
                {label}
              </span>
              <span className="text-xs text-gray-400">{description}</span>
            </button>
          );
        })}
      </div>

      {source === "manual" && (
        <ManualTaskPicker
          tasks={tasks}
          topics={topics}
          selectedTaskIds={selectedTaskIds}
          onTaskToggle={onTaskToggle}
        />
      )}

      {source === "variant" && <ExamVariantPicker />}

      {source === "constructor" && (
        <ExamConstructor
          tasks={tasks}
          slots={constructorSlots}
          onSlotChange={onSlotChange}
        />
      )}
    </div>
  );
};
