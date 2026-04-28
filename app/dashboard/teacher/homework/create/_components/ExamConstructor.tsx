"use client";

import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import type { TaskForPicker } from "../_lib/getCreateHomeworkData";

const EXAM_SLOTS = Array.from({ length: 19 }, (_, i) => i + 1);

interface ExamConstructorProps {
  tasks: TaskForPicker[];
  slots: Record<number, string | null>;
  onSlotChange: (examNumber: number, taskId: string | null) => void;
}

export const ExamConstructor = ({
  tasks,
  slots,
  onSlotChange,
}: ExamConstructorProps) => {
  const [openSlot, setOpenSlot] = useState<number | null>(null);

  const filledCount = EXAM_SLOTS.filter((n) => slots[n]).length;

  const tasksForSlot = (examNumber: number) =>
    tasks.filter((t) => t.examNumber === examNumber);

  const taskById = (id: string | null) =>
    id ? tasks.find((t) => t.id === id) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Выбрано заданий:{" "}
          <span className="font-semibold text-gray-800">{filledCount}</span> из
          19
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${(filledCount / 19) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {EXAM_SLOTS.map((num) => {
          const selectedTask = taskById(slots[num] ?? null);
          const available = tasksForSlot(num);
          const isOpen = openSlot === num;

          return (
            <div key={num} className="rounded-xl border border-gray-200">
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  selectedTask ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    selectedTask
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {num}
                </span>

                {selectedTask ? (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate text-sm font-medium text-gray-800">
                      {selectedTask.title ?? selectedTask.topicTitle}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {selectedTask.topicTitle}
                    </span>
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-gray-400">
                    Задание №{num} не выбрано
                  </span>
                )}

                <div className="flex shrink-0 items-center gap-1">
                  {selectedTask && (
                    <button
                      type="button"
                      onClick={() => onSlotChange(num, null)}
                      className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {available.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOpenSlot(isOpen ? null : num)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      {selectedTask ? (
                        <>
                          Сменить
                          <ChevronDown
                            className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          Выбрать
                        </>
                      )}
                    </button>
                  )}
                  {available.length === 0 && !selectedTask && (
                    <span className="text-xs text-gray-300">нет задач</span>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100">
                  {available.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        onSlotChange(num, task.id);
                        setOpenSlot(null);
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                        slots[num] === task.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {task.title ?? task.topicTitle}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {task.condition}
                        </p>
                      </div>
                      {slots[num] === task.id && (
                        <span className="shrink-0 text-xs font-medium text-blue-600">
                          Выбрано
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
