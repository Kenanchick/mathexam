import { RotateCcw, Search } from "lucide-react";
import type { CatalogTaskProgressStatus } from "../_lib/getTasksCatalog";

type TaskCatalogFiltersProps = {
  search: string;
  status: "all" | CatalogTaskProgressStatus;
  numberFilter: string;
  topicFilter: string;
  difficultyFilter: string;
  numbers: number[];
  topics: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | CatalogTaskProgressStatus) => void;
  onNumberChange: (value: string) => void;
  onTopicChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onReset: () => void;
};

const statusTabs = [
  { label: "Все", value: "all" },
  { label: "Решенные", value: "solved" },
  { label: "Нерешенные", value: "unsolved" },
  { label: "С ошибками", value: "error" },
] as const;

export const TaskCatalogFilters = ({
  search,
  status,
  numberFilter,
  topicFilter,
  difficultyFilter,
  numbers,
  topics,
  onSearchChange,
  onStatusChange,
  onNumberChange,
  onTopicChange,
  onDifficultyChange,
  onReset,
}: TaskCatalogFiltersProps) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-[160px_230px_200px_1fr] gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Номер задания
          </label>

          <select
            value={numberFilter}
            onChange={(event) => onNumberChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500"
          >
            <option value="all">1–19</option>

            {numbers.map((number) => (
              <option key={number} value={number}>
                Задание {number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Тема
          </label>

          <select
            value={topicFilter}
            onChange={(event) => onTopicChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500"
          >
            <option value="all">Все темы</option>

            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Сложность
          </label>

          <select
            value={difficultyFilter}
            onChange={(event) => onDifficultyChange(event.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-blue-500"
          >
            <option value="all">Все уровни</option>
            <option value="EASY">Легкая</option>
            <option value="MEDIUM">Средняя</option>
            <option value="HARD">Сложная</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">
            Статус
          </label>

          <div className="grid h-11 grid-cols-4 overflow-hidden rounded-lg border border-gray-200">
            {statusTabs.map((tab) => {
              const isActive = status === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onStatusChange(tab.value)}
                  className={`border-r border-gray-200 text-sm font-medium last:border-r-0 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_200px] gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по задачам"
            className="h-12 w-full rounded-lg border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить фильтры
        </button>
      </div>
    </section>
  );
};
