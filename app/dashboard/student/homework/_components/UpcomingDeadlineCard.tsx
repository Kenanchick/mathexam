"use client";

import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeworkCalendar } from "../_lib/getHomeworkData";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface UpcomingDeadlineCardProps {
  calendar: HomeworkCalendar;
}

export const UpcomingDeadlineCard = ({ calendar }: UpcomingDeadlineCardProps) => {
  const { monthTitle, today, deadlineDays, rows, upcomingDeadlines } = calendar;
  const deadlineDaySet = new Set(deadlineDays);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Ближайший дедлайн
      </h3>

      {/* Mini calendar */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {monthTitle}
          </span>
          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[11px] font-medium text-gray-400"
            >
              {d}
            </div>
          ))}
          {rows.flat().map((day, i) => (
            <div key={i} className="flex flex-col items-center py-0.5">
              {day ? (
                <button
                  className={cn(
                    "relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    day === today
                      ? "animate-pulse bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-300 ring-offset-1"
                      : deadlineDaySet.has(day)
                        ? "font-semibold text-blue-600 hover:bg-blue-50"
                        : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  {day}
                  {deadlineDaySet.has(day) && day !== today && (
                    <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                  )}
                </button>
              ) : (
                <span className="h-7 w-7" />
              )}
            </div>
          ))}
        </div>
      </div>

      {upcomingDeadlines.length > 0 ? (
        <>
          <p className="mb-3 text-xs font-medium text-gray-500">
            {upcomingDeadlines.length}{" "}
            {upcomingDeadlines.length === 1 ? "задание" : "задания"} на ближайших
            2 недели
          </p>

          <ul className="mb-4 space-y-2.5">
            {upcomingDeadlines.map((entry) => (
              <li
                key={entry.title}
                className="flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      entry.color === "yellow" ? "bg-amber-400" : "bg-blue-500",
                    )}
                  />
                  <span className="text-xs leading-snug text-gray-700">
                    {entry.title}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {entry.date}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mb-4 text-xs text-gray-400">
          Ближайших дедлайнов нет
        </p>
      )}

      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
        Смотреть все дедлайны
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
