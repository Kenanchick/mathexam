"use client";

import { motion } from "framer-motion";
import type { TeacherDashboardActivity, ActivityBadge } from "../_lib/getTeacherDashboardData";

const badgeConfig: Record<ActivityBadge, { label: string; className: string }> = {
  submitted: { label: "Сдано", className: "border border-emerald-200 bg-emerald-50 text-emerald-700" },
  reviewing: { label: "На проверке", className: "border border-gray-200 bg-gray-50 text-gray-600" },
  overdue: { label: "Дедлайн", className: "border border-red-200 bg-red-50 text-red-600" },
  progress: { label: "Проверено", className: "border border-gray-200 bg-gray-50 text-gray-600" },
};

interface TeacherActivityFeedProps {
  events: TeacherDashboardActivity[];
}

export const TeacherActivityFeed = ({ events }: TeacherActivityFeedProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded border border-gray-200 bg-white"
    >
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <h2 className="text-[16px] font-semibold text-gray-900">Последняя активность</h2>
      </div>

      {events.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] font-medium text-gray-500">Активности пока нет</p>
          <p className="mt-1 text-[13px] text-gray-400">
            Здесь появятся события по сдачам и проверке работ
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.25 + index * 0.04 }}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-gray-50/60"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[11px] font-semibold text-gray-600">
                {event.avatarText}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] leading-snug text-gray-700">{event.text}</p>
                <p className="mt-0.5 text-[12px] text-gray-400">{event.time}</p>
              </div>

              {event.badge && (
                <span className={`shrink-0 self-center rounded px-2 py-0.5 text-[11px] font-medium ${badgeConfig[event.badge].className}`}>
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
