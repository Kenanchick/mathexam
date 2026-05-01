"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TeacherDashboardClass } from "../_lib/getTeacherDashboardData";

interface TeacherClassesSectionProps {
  classes: TeacherDashboardClass[];
}

export const TeacherClassesSection = ({ classes }: TeacherClassesSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="rounded border border-gray-200 bg-white"
    >
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <h2 className="text-[16px] font-semibold text-gray-900">Классы</h2>
        <Link
          href="/dashboard/teacher/classes"
          className="text-[13px] font-medium text-gray-500 transition hover:text-gray-800"
        >
          Все классы
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-[14px] font-medium text-gray-500">Классов пока нет</p>
          <p className="mt-1 text-[13px] text-gray-400">Создайте класс и пригласите учеников</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {classes.slice(0, 4).map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: 0.2 + index * 0.06 }}
              className="px-5 py-4 transition-colors hover:bg-gray-50/60"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[16px] font-semibold text-gray-900">{cls.name}</span>
                    <span className="text-[13px] text-gray-400">{cls.studentCount} уч.</span>
                  </div>

                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[12px] text-gray-400">Средний прогресс</span>
                      <span className="text-[13px] font-semibold text-gray-700">{cls.avgProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-gray-100">
                      <motion.div
                        className="h-full bg-gray-900"
                        initial={{ width: 0 }}
                        animate={{ width: `${cls.avgProgress}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 space-y-0.5 text-right">
                  <p className="text-[12px] text-gray-400">
                    ДЗ: <span className="font-medium text-gray-700">{cls.homeworkCount}</span>
                  </p>
                  <p className="text-[12px] text-gray-400">
                    На проверке:{" "}
                    <span className={`font-medium ${cls.pendingReviews > 0 ? "text-gray-900" : "text-gray-500"}`}>
                      {cls.pendingReviews}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <Link
                  href={`/dashboard/teacher/classes/${cls.id}`}
                  className="flex items-center gap-1 text-[13px] font-medium text-gray-500 transition hover:text-gray-800"
                >
                  Открыть класс
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {classes.length > 4 && (
        <div className="border-t border-gray-200 px-5 py-2.5">
          <Link
            href="/dashboard/teacher/classes"
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 transition hover:text-gray-800"
          >
            Ещё {classes.length - 4} {pluralizeClasses(classes.length - 4)}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </motion.div>
  );
};

function pluralizeClasses(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "класс";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "класса";
  return "классов";
}
