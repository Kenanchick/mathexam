"use client";

import { useMemo, useState } from "react";
import { TaskCatalogFilters } from "./TaskCatalogFilters";
import { TaskCard } from "./TaskCard";
import { CatalogProgressAside } from "./CatalogProgressAside";
import type {
  CatalogTaskProgressStatus,
  TasksCatalogView,
} from "../_lib/getTasksCatalog";

export const TasksCatalogContent = ({
  catalog,
}: {
  catalog: TasksCatalogView;
}) => {
  const [status, setStatus] = useState<"all" | CatalogTaskProgressStatus>(
    "all",
  );
  const [search, setSearch] = useState("");
  const [numberFilter, setNumberFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const availableTopics = useMemo(() => {
    const tasksForSelectedNumber =
      numberFilter === "all"
        ? catalog.tasks
        : catalog.tasks.filter((task) => task.number === Number(numberFilter));

    return Array.from(
      new Set(tasksForSelectedNumber.map((task) => task.topic)),
    ).sort((a, b) => a.localeCompare(b, "ru"));
  }, [catalog.tasks, numberFilter]);

  const effectiveTopicFilter =
    topicFilter === "all" || availableTopics.includes(topicFilter)
      ? topicFilter
      : "all";

  const filteredTasks = useMemo(() => {
    return catalog.tasks.filter((task) => {
      const normalizedSearch = search.trim().toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.topic.toLowerCase().includes(normalizedSearch) ||
        task.condition.toLowerCase().includes(normalizedSearch);

      const matchesStatus = status === "all" || task.status === status;

      const matchesNumber =
        numberFilter === "all" || task.number === Number(numberFilter);

      const matchesTopic =
        effectiveTopicFilter === "all" || task.topic === effectiveTopicFilter;

      const matchesDifficulty =
        difficultyFilter === "all" || task.difficulty === difficultyFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesNumber &&
        matchesTopic &&
        matchesDifficulty
      );
    });
  }, [
    catalog.tasks,
    search,
    status,
    numberFilter,
    effectiveTopicFilter,
    difficultyFilter,
  ]);

  const handleResetFilters = () => {
    setStatus("all");
    setSearch("");
    setNumberFilter("all");
    setTopicFilter("all");
    setDifficultyFilter("all");
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          Каталог задач
        </h1>
        <p className="mt-1 text-[16px] text-gray-500">
          Задания ЕГЭ · Профильная математика
        </p>
      </div>

      <TaskCatalogFilters
        search={search}
        status={status}
        numberFilter={numberFilter}
        topicFilter={effectiveTopicFilter}
        difficultyFilter={difficultyFilter}
        numbers={catalog.filters.numbers}
        topics={availableTopics}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onNumberChange={setNumberFilter}
        onTopicChange={setTopicFilter}
        onDifficultyChange={setDifficultyFilter}
        onReset={handleResetFilters}
      />

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_296px] gap-5">
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="rounded border border-gray-200 bg-white px-6 py-8 text-[15px] text-gray-500">
              По выбранным фильтрам задач не найдено.
            </div>
          )}
        </div>

        <CatalogProgressAside progress={catalog.progress} />
      </div>
    </div>
  );
};
