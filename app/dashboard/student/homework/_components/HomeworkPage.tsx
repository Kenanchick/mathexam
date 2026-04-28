"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Домашние задания</h1>
        <p className="mt-1 text-sm text-gray-500">
          Все задания от преподавателей в одном месте
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_304px]">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.05 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-gray-100 bg-white px-2 shadow-sm">
            <HomeworkTabs
              activeTab={activeTab}
              counts={counts}
              onTabChange={setActiveTab}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию или учителю"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <HomeworkTable items={filteredItems} />
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          className="space-y-4"
        >
          <UpcomingDeadlineCard deadlines={data.deadlines} />
          <HomeworkStatsCard stats={data.stats} />
        </motion.div>
      </div>
    </div>
  );
};
