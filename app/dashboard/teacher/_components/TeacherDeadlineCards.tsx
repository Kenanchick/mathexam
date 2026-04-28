"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import type { TeacherDeadlineItem } from "../_lib/getTeacherDashboardData";

function formatDeadline(date: Date): { label: string; urgency: "today" | "tomorrow" | "soon" } {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const dayAfterTomorrow = new Date(tomorrowStart);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  if (date < dayAfterTomorrow && date >= tomorrowStart) {
    return { label: `Завтра, ${time}`, urgency: "tomorrow" };
  }
  if (date >= todayStart && date < tomorrowStart) {
    return { label: `Сегодня, ${time}`, urgency: "today" };
  }
  const dateStr = date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  return { label: `${dateStr}, ${time}`, urgency: "soon" };
}

const urgencyStyles = {
  today: {
    badge: "bg-red-50 text-red-600",
    bar: "bg-red-400",
    icon: "text-red-400",
  },
  tomorrow: {
    badge: "bg-orange-50 text-orange-600",
    bar: "bg-orange-400",
    icon: "text-orange-400",
  },
  soon: {
    badge: "bg-blue-50 text-blue-600",
    bar: "bg-blue-400",
    icon: "text-blue-400",
  },
};

interface TeacherDeadlineCardsProps {
  deadlines: TeacherDeadlineItem[];
}

export const TeacherDeadlineCards = ({ deadlines }: TeacherDeadlineCardsProps) => {
  if (deadlines.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-4 text-sm text-gray-400"
      >
        <CalendarClock className="h-4 w-4 shrink-0" />
        Ближайших дедлайнов нет — все задания сданы или сроки не установлены
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {deadlines.map((item, index) => {
        const { label, urgency } = formatDeadline(item.deadline);
        const styles = urgencyStyles[urgency];
        const progress =
          item.totalCount > 0
            ? Math.round((item.submittedCount / item.totalCount) * 100)
            : 0;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 flex-1 text-[15px] font-semibold leading-snug text-gray-900">
                {item.title}
              </p>
              <CalendarClock className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                {label}
              </span>
              {item.classroomName ? (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {item.classroomName}
                </span>
              ) : (
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Индивидуально
                </span>
              )}
            </div>

            <div className="mt-auto">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-gray-400">Сдали</span>
                <span className="text-xs font-semibold text-gray-700">
                  {item.submittedCount} / {item.totalCount}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className={`h-full rounded-full ${styles.bar}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
