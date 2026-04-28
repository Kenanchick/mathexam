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
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: Star,
      label: "Новых",
      value: stats.newCount,
      color: "text-amber-500 bg-amber-50",
    },
    {
      icon: CheckCircle2,
      label: "Сдано за месяц",
      value: stats.submittedThisMonth,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Итоги по домашним заданиям
      </h3>
      <ul className="space-y-3">
        {items.map(({ icon: Icon, label, value, color }) => (
          <li key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
