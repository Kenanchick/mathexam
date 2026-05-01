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
  { label: "Решённые", value: "solved" },
  { label: "Нерешённые", value: "unsolved" },
] as const;

const selectClass =
  "h-10 w-full rounded border border-gray-200 bg-white px-3 text-[15px] text-gray-700 outline-none transition focus:border-gray-400";

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
    <section className="rounded border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-[150px_1fr_170px_1fr] gap-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium uppercase tracking-wide text-gray-500">
            Номер задания
          </label>
          <select
            value={numberFilter}
            onChange={(e) => onNumberChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">1–19</option>
            {numbers.map((n) => (
              <option key={n} value={n}>
                Задание {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium uppercase tracking-wide text-gray-500">
            Тема
          </label>
          <select
            value={topicFilter}
            onChange={(e) => onTopicChange(e.target.value)}
            className={selectClass}
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
          <label className="mb-1.5 block text-[13px] font-medium uppercase tracking-wide text-gray-500">
            Сложность
          </label>
          <select
            value={difficultyFilter}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className={selectClass}
          >
            <option value="all">Все уровни</option>
            <option value="EASY">Лёгкая</option>
            <option value="MEDIUM">Средняя</option>
            <option value="HARD">Сложная</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium uppercase tracking-wide text-gray-500">
            Статус
          </label>
          <div className="grid h-10 grid-cols-3 overflow-hidden rounded border border-gray-200">
            {statusTabs.map((tab) => {
              const isActive = status === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onStatusChange(tab.value)}
                  className={`border-r border-gray-200 text-[14px] font-medium last:border-r-0 transition ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_160px] gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Поиск по задачам"
            className="h-10 w-full rounded border border-gray-200 bg-white pl-10 pr-4 text-[15px] outline-none transition placeholder:text-gray-400 focus:border-gray-400"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex h-10 items-center justify-center gap-2 rounded border border-gray-200 bg-white text-[14px] font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Сбросить
        </button>
      </div>
    </section>
  );
};
