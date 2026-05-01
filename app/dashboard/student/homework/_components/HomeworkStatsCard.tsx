import { ClipboardList, Star, CheckCircle2 } from "lucide-react";
import type { HomeworkPageData } from "../_lib/getHomeworkData";

interface HomeworkStatsCardProps {
  stats: HomeworkPageData["stats"];
}

export const HomeworkStatsCard = ({ stats }: HomeworkStatsCardProps) => {
  const items = [
    {
      icon: ClipboardList,
      label: "Всего активных",
      value: stats.totalActive,
    },
    {
      icon: Star,
      label: "Новых",
      value: stats.newCount,
    },
    {
      icon: CheckCircle2,
      label: "Сдано за месяц",
      value: stats.submittedThisMonth,
    },
  ];

  return (
    <div className="rounded border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
        <h3 className="text-[16px] font-semibold text-gray-900">
          Итоги по заданиям
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {items.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-gray-50">
                <Icon className="h-4 w-4 text-gray-500" />
              </div>
              <span className="text-[15px] text-gray-600">{label}</span>
            </div>
            <span className="text-[16px] font-semibold text-gray-900">
              {value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
