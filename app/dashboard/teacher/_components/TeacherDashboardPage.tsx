"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TeacherHomeworkSection } from "./TeacherHomeworkSection";
import { TeacherClassesSection } from "./TeacherClassesSection";
import { TeacherActivityFeed } from "./TeacherActivityFeed";
import { TeacherQuickActions } from "./TeacherQuickActions";
import type { TeacherDashboardData } from "../_lib/getTeacherDashboardData";

interface TeacherDashboardPageProps {
  data: TeacherDashboardData;
}

export const TeacherDashboardPage = ({ data }: TeacherDashboardPageProps) => {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
            Добрый день, {data.teacherName}
          </h1>
          <p className="mt-1 text-[16px] text-gray-500">
            {data.stats.pendingReviewCount > 0
              ? `${data.stats.pendingReviewCount} работ ожидают проверки`
              : "Всё проверено — новых работ нет"}
          </p>
        </div>

        <Link
          href="/dashboard/teacher/homework/create"
          className="flex h-9 items-center gap-2 rounded border border-gray-900 bg-gray-900 px-4 text-[14px] font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Создать ДЗ
        </Link>
      </motion.div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-5">
        <div className="flex flex-col gap-5">
          <TeacherHomeworkSection reviews={data.reviews} />
          <TeacherActivityFeed events={data.activityEvents} />
        </div>
        <div className="flex flex-col gap-5">
          <TeacherClassesSection classes={data.classes} />
          <TeacherQuickActions />
        </div>
      </div>
    </div>
  );
};
