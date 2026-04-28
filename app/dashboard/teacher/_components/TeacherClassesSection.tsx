"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TeacherDashboardClass } from "../_lib/getTeacherDashboardData";

interface TeacherClassesSectionProps {
  classes: TeacherDashboardClass[];
}

export const TeacherClassesSection = ({
  classes,
}: TeacherClassesSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Классы</h2>
        <Link
          href="/dashboard/teacher/classes"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Все классы
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <p className="text-sm font-medium text-gray-500">Классов пока нет</p>
          <p className="text-xs text-gray-400">
            Создайте класс и пригласите учеников
          </p>
        </div>
      ) : (
      <div className="divide-y divide-gray-100">
        {classes.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
            className="px-6 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {cls.name}
                  </span>
                  <span className="text-[15px] text-gray-400">
                    {cls.studentCount} учеников
                  </span>
                </div>

                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Средний прогресс
                    </span>
                    <span className="text-[15px] font-semibold text-gray-900">
                      {cls.avgProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      className="h-full rounded-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${cls.avgProgress}%` }}
                      transition={{
                        duration: 0.7,
                        delay: 0.5 + index * 0.1,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 space-y-0.5 text-right text-sm text-gray-500">
                <p>
                  Домашних заданий:{" "}
                  <span className="font-medium text-gray-700">
                    {cls.homeworkCount}
                  </span>
                </p>
                <p>
                  На проверке:{" "}
                  <span className="font-medium text-orange-600">
                    {cls.pendingReviews}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3">
              <Link
                href={`/dashboard/teacher/classes/${cls.id}`}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Открыть класс
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </motion.div>
  );
};
