"use client";

import { motion } from "framer-motion";
import {
  Users2,
  GraduationCap,
  ClipboardCheck,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { TeacherStat } from "../_lib/teacherDashboardTypes";

const iconByVariant = {
  blue: Users2,
  green: GraduationCap,
  orange: ClipboardCheck,
  purple: Target,
};

const variantStyles = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-500",
  purple: "bg-violet-50 text-violet-600",
};

interface TeacherStatsCardsProps {
  stats: TeacherStat[];
}

export const TeacherStatsCards = ({ stats }: TeacherStatsCardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = iconByVariant[stat.variant];

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${variantStyles[stat.variant]}`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="mt-1 text-4xl font-bold leading-none text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 pl-[72px]">
              {stat.trend === "neutral" ? (
                <Minus className="h-3.5 w-3.5 text-gray-400" />
              ) : stat.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-[15px] ${
                  stat.trend === "neutral"
                    ? "text-gray-400"
                    : stat.trend === "up"
                      ? "text-emerald-600"
                      : "text-red-500"
                }`}
              >
                {stat.subtitle}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
