"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeadlineEntry } from "../_lib/getHomeworkData";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function buildCalendarRows(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function buildMonthTitle(year: number, month: number): string {
  const name = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(
    new Date(year, month),
  );
  return `${name[0].toUpperCase()}${name.slice(1)} ${year}`;
}

function formatDeadlineDate(isoString: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
  }).format(new Date(isoString));
}

interface UpcomingDeadlineCardProps {
  deadlines: DeadlineEntry[];
}

export const UpcomingDeadlineCard = ({ deadlines }: UpcomingDeadlineCardProps) => {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const today = now.getDate();
  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const rows = useMemo(
    () => buildCalendarRows(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthTitle = useMemo(
    () => buildMonthTitle(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const deadlinesByDay = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const entry of deadlines) {
      const d = new Date(entry.deadlineIso);
      if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(entry.title);
      }
    }
    return map;
  }, [deadlines, viewYear, viewMonth]);

  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
  const upcomingDeadlines = useMemo(() => {
    return deadlines
      .filter((e) => {
        const d = new Date(e.deadlineIso);
        return d > now && d.getTime() - now.getTime() <= fourteenDaysMs;
      })
      .sort((a, b) => new Date(a.deadlineIso).getTime() - new Date(b.deadlineIso).getTime())
      .slice(0, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlines]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setHoveredDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setHoveredDay(null);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Ближайший дедлайн
      </h3>

      {/* Calendar */}
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {monthTitle}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100"
          >
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

          {rows.flat().map((day, i) => {
            const hasDeadline = day !== null && !!deadlinesByDay[day];
            const isToday = isCurrentMonth && day === today;
            const titles = day !== null ? (deadlinesByDay[day] ?? []) : [];

            return (
              <div key={i} className="relative flex flex-col items-center py-0.5">
                {day ? (
                  <>
                    <button
                      className={cn(
                        "relative flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        isToday
                          ? "animate-pulse bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-300 ring-offset-1"
                          : hasDeadline
                            ? "font-semibold text-blue-600 hover:bg-blue-50"
                            : "text-gray-700 hover:bg-gray-100",
                      )}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {day}
                      {hasDeadline && !isToday && (
                        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-500" />
                      )}
                    </button>

                    {hoveredDay === day && titles.length > 0 && (
                      <div className="absolute bottom-full left-1/2 z-50 mb-2 w-max max-w-[200px] -translate-x-1/2 rounded-xl bg-gray-900 px-3 py-2 shadow-xl">
                        {titles.map((title, idx) => (
                          <p
                            key={idx}
                            className="text-[11px] leading-snug text-white"
                          >
                            {title}
                          </p>
                        ))}
                        <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent border-t-gray-900" />
                      </div>
                    )}
                  </>
                ) : (
                  <span className="h-7 w-7" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      {upcomingDeadlines.length > 0 ? (
        <>
          <p className="mb-3 text-xs font-medium text-gray-500">
            {upcomingDeadlines.length}{" "}
            {upcomingDeadlines.length === 1 ? "задание" : "задания"} на
            ближайших 2 недели
          </p>

          <ul className="mb-4 space-y-2.5">
            {upcomingDeadlines.map((entry, idx) => (
              <li
                key={entry.deadlineIso + entry.title}
                className="flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      idx === 0 ? "bg-amber-400" : "bg-blue-500",
                    )}
                  />
                  <span className="text-xs leading-snug text-gray-700">
                    {entry.title}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDeadlineDate(entry.deadlineIso)}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mb-4 text-xs text-gray-400">Ближайших дедлайнов нет</p>
      )}

      <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 py-2.5 text-xs font-semibold text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600">
        Смотреть все дедлайны
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
