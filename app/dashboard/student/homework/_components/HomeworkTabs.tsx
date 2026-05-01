"use client";

import { cn } from "@/lib/utils";
import {
  TAB_CONFIG,
  type HomeworkTab,
  type HomeworkStatus,
} from "../_lib/homeworkTabs";

interface HomeworkTabsProps {
  activeTab: HomeworkTab;
  counts: Record<HomeworkStatus, number>;
  onTabChange: (tab: HomeworkTab) => void;
}

export const HomeworkTabs = ({
  activeTab,
  counts,
  onTabChange,
}: HomeworkTabsProps) => {
  return (
    <div className="flex items-center gap-0 border-b border-gray-200">
      {TAB_CONFIG.map(({ key, label, status }) => {
        const count = status ? counts[status] : 0;
        const active = activeTab === key;

        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-3 text-[15px] font-medium transition-colors",
              active ? "text-gray-900" : "text-gray-500 hover:text-gray-800",
            )}
          >
            {label}
            <span
              className={cn(
                "flex h-5 min-w-5 items-center justify-center rounded px-1.5 text-[12px] font-semibold transition-colors",
                active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500",
              )}
            >
              {count}
            </span>
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        );
      })}
    </div>
  );
};
