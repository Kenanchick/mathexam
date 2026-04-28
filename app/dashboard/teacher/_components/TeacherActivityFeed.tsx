"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { TeacherDashboardActivity, ActivityBadge } from "../_lib/getTeacherDashboardData";

const badgeConfig: Record<ActivityBadge, { label: string; className: string }> =
  {
    submitted: { label: "Сдано", className: "bg-emerald-50 text-emerald-600" },
    reviewing: { label: "На проверке", className: "bg-blue-50 text-blue-600" },
    overdue: { label: "Дедлайн", className: "bg-red-50 text-red-500" },
    progress: { label: "Проверено", className: "bg-violet-50 text-violet-600" },
  };

interface TeacherActivityFeedProps {
  events: TeacherDashboardActivity[];
}

export const TeacherActivityFeed = ({ events }: TeacherActivityFeedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Последняя активность
        </h2>
        <Link
          href="/dashboard/teacher/activity"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Смотреть всё
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <p className="text-[15px] font-medium text-gray-500">
            Активности пока нет
          </p>
          <p className="text-sm text-gray-400">
            Здесь появятся события по сдачам и проверке работ
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.5 + index * 0.06 }}
              className="flex items-start gap-3 px-6 py-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                {event.avatarText}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-snug text-gray-700">
                  {event.text}
                </p>
                <p className="mt-0.5 text-sm text-gray-400">{event.time}</p>
              </div>

              {event.badge && (
                <span
                  className={`shrink-0 self-center rounded-lg px-2.5 py-0.5 text-xs font-medium ${badgeConfig[event.badge].className}`}
                >
                  {badgeConfig[event.badge].label}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
