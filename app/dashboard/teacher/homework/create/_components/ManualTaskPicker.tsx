"use client";

import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import type { TaskForPicker, TopicOption } from "../_lib/getCreateHomeworkData";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Лёгкая",
  MEDIUM: "Средняя",
  HARD: "Сложная",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-orange-50 text-orange-700",
  HARD: "bg-red-50 text-red-700",
};

interface ManualTaskPickerProps {
  tasks: TaskForPicker[];
  topics: TopicOption[];
  selectedTaskIds: string[];
  onTaskToggle: (id: string) => void;
}

export const ManualTaskPicker = ({
  tasks,
  topics,
  selectedTaskIds,
  onTaskToggle,
}: ManualTaskPickerProps) => {
  const [filterNumber, setFilterNumber] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filterNumber && String(t.examNumber) !== filterNumber) return false;
      if (filterTopicId && t.topicId !== filterTopicId) return false;
      if (filterDifficulty && t.difficulty !== filterDifficulty) return false;
      if (search) {
        const q = search.toLowerCase();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const conditionMatch = t.condition.toLowerCase().includes(q);
        if (!titleMatch && !conditionMatch) return false;
      }
      return true;
    });
  }, [tasks, filterNumber, filterTopicId, filterDifficulty, search]);

  const selectedTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));

  const examNumbers = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.examNumber))).sort((a, b) => a - b),
    [tasks],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по условию..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={filterNumber}
          onChange={(e) => setFilterNumber(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Все номера</option>
          {examNumbers.map((n) => (
            <option key={n} value={n}>
              №{n}
            </option>
          ))}
        </select>

        <select
          value={filterTopicId}
          onChange={(e) => setFilterTopicId(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Все темы</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">Любая сложность</option>
          <option value="EASY">Лёгкая</option>
          <option value="MEDIUM">Средняя</option>
          <option value="HARD">Сложная</option>
        </select>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-400">
            Задачи не найдены
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((task) => {
              const checked = selectedTaskIds.includes(task.id);
              return (
                <label
                  key={task.id}
                  className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors ${
                    checked ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTaskToggle(task.id)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                        №{task.examNumber}
                      </span>
                      <span className="truncate text-sm font-medium text-gray-800">
                        {task.title ?? task.topicTitle}
                      </span>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${DIFFICULTY_BADGE[task.difficulty]}`}
                      >
                        {DIFFICULTY_LABELS[task.difficulty]}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                      {task.condition}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {selectedTasks.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Выбрано задач: {selectedTasks.length}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTasks.map((task) => (
              <span
                key={task.id}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
              >
                №{task.examNumber} —{" "}
                {task.title ?? task.topicTitle}
                <button
                  type="button"
                  onClick={() => onTaskToggle(task.id)}
                  className="ml-0.5 rounded-sm text-blue-400 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
