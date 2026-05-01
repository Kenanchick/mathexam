"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DayActivity } from "../_lib/progressTypes";

const FlameIcon = ({ active }: { active: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="flame-grad" x1="10" y1="2" x2="10" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor={active ? "#FDBA74" : "#D1D5DB"} />
        <stop offset="100%" stopColor={active ? "#EA580C" : "#9CA3AF"} />
      </linearGradient>
    </defs>
    {/* Outer flame */}
    <path
      d="M10 2C10 2 12 5.5 11.5 8C13.5 6 14 3.5 14 3.5C16 6 16.5 9 16 11.5C17 10.5 17.5 9 17.5 9C17.5 13.5 15 16.5 11.5 17.5C12.5 15.5 12.5 14 12 12.5C10.5 15 8.5 16.5 7 17.5C4 15.5 3 12.5 3 10C3 7 4.5 5 6.5 4.5C6 6 6.5 7.5 7.5 8.5C7.5 5.5 8.5 3 10 2Z"
      fill="url(#flame-grad)"
    />
    {/* Inner core */}
    <path
      d="M10 9C10 9 10.8 10.5 10.5 11.5C11.5 10.8 11.8 9.5 11.8 9.5C12.5 10.5 12.5 12 12 13C12.5 12.5 12.8 11.8 12.8 11.8C12.8 13.5 11.8 15 10 15.5C10.5 14.5 10.5 13.5 10.2 13C9.5 14 8.5 14.8 7.8 15.5C6.5 14.2 6.2 12.5 6.5 11C6.5 12 7 12.5 7.5 12.8C7.2 11.5 7.8 10 10 9Z"
      fill={active ? "white" : "#E5E7EB"}
      opacity="0.55"
    />
  </svg>
);

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(d);
}

function getWeekday(dateStr: string): string {
  const d = new Date(dateStr);
  return WEEKDAYS[(d.getDay() + 6) % 7] ?? "";
}

interface ActivityChartProps {
  dailyActivity: DayActivity[];
  streak: number;
}

export const ActivityChart = ({ dailyActivity, streak }: ActivityChartProps) => {
  const maxSolved = Math.max(...dailyActivity.map((d) => d.solvedCount), 1);
  const totalThisMonth = dailyActivity.reduce((s, d) => s + d.solvedCount, 0);
  const activeDays = dailyActivity.filter((d) => d.solvedCount > 0).length;

  return (
    <div className="rounded border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-gray-900">Активность</h2>
          <div className="flex items-center gap-4 text-[13px] text-gray-500">
            <span>
              <span className="font-semibold text-gray-900">{totalThisMonth}</span> задач за 30 дней
            </span>
            <span>
              <span className="font-semibold text-gray-900">{activeDays}</span> активных дней
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3">
        {/* Bar chart */}
        <div className="flex items-end gap-[3px]" style={{ height: 64 }}>
          {dailyActivity.map((day, i) => {
            const heightPct = (day.solvedCount / maxSolved) * 100;
            const isToday = i === dailyActivity.length - 1;
            const active = day.solvedCount > 0;

            return (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: 64 }}>
                <motion.div
                  className={cn(
                    "w-full rounded-sm transition-colors",
                    isToday && active ? "bg-gray-900" :
                    active ? "bg-gray-500" :
                    "bg-gray-100",
                  )}
                  style={{ minHeight: active ? 3 : 2 }}
                  initial={{ height: 0 }}
                  animate={{ height: active ? `${Math.max(heightPct, 8)}%` : "3%" }}
                  transition={{ duration: 0.4, delay: i * 0.008, ease: "easeOut" }}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  <p className="font-medium">{formatShortDate(day.date)} · {getWeekday(day.date)}</p>
                  <p className="text-gray-500">{day.solvedCount} задач, {day.correctCount} верно</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels — every 7 days */}
        <div className="relative mt-1.5 flex" style={{ height: 16 }}>
          {dailyActivity.map((day, i) => {
            if (i % 7 !== 0 && i !== dailyActivity.length - 1) return <div key={day.date} className="flex-1" />;
            const label = i === dailyActivity.length - 1 ? "сег." : formatShortDate(day.date).replace(" г.", "");
            return (
              <div key={day.date} className="flex flex-1 justify-start">
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Streak */}
      <div className="border-t border-gray-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <FlameIcon active={streak > 0} />
          <div>
            <span className="text-[15px] font-semibold text-gray-900">{streak}</span>
            <span className="ml-1 text-[13px] text-gray-500">
              {streak === 1 ? "день подряд" : streak >= 2 && streak <= 4 ? "дня подряд" : "дней подряд"}
            </span>
          </div>
          {streak === 0 && (
            <span className="text-[13px] text-gray-400">— решите задачу сегодня, чтобы начать серию</span>
          )}
        </div>
      </div>
    </div>
  );
};
