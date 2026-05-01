"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HomeworkTabs } from "./HomeworkTabs";
import { HomeworkTable } from "./HomeworkTable";
import { UpcomingDeadlineCard } from "./UpcomingDeadlineCard";
import { HomeworkStatsCard } from "./HomeworkStatsCard";
import type { HomeworkPageData, HomeworkTab } from "../_lib/getHomeworkData";

interface HomeworkPageProps {
  data: HomeworkPageData;
}

export const HomeworkPage = ({ data }: HomeworkPageProps) => {
  const [activeTab, setActiveTab] = useState<HomeworkTab>("in_progress");
  const [search, setSearch] = useState("");

  const counts = useMemo(
    () => ({
      new: data.items.filter((h) => h.status === "new").length,
      in_progress: data.items.filter((h) => h.status === "in_progress").length,
      submitted: data.items.filter((h) => h.status === "submitted").length,
      overdue: data.items.filter((h) => h.status === "overdue").length,
    }),
    [data.items],
  );

  const filteredItems = useMemo(() => {
    const byTab = data.items.filter((h) => h.status === activeTab);
    if (!search.trim()) return byTab;
    const q = search.toLowerCase();
    return byTab.filter(
      (h) =>
        h.title.toLowerCase().includes(q) ||
        h.teacher.toLowerCase().includes(q),
    );
  }, [data.items, activeTab, search]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          Домашние задания
        </h1>
        <p className="mt-1 text-[16px] text-gray-500">
          Все задания от преподавателей в одном месте
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_296px]">
        <div className="space-y-3">
          <div className="rounded border border-gray-200 bg-white px-2">
            <HomeworkTabs
              activeTab={activeTab}
              counts={counts}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или учителю"
              className="h-10 w-full rounded border border-gray-200 bg-white pl-10 pr-4 text-[15px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
            />
          </div>

          <HomeworkTable items={filteredItems} />
        </div>

        <div className="space-y-4">
          <UpcomingDeadlineCard deadlines={data.deadlines} />
          <HomeworkStatsCard stats={data.stats} />
        </div>
      </div>
    </div>
  );
};
