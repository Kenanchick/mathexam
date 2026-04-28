"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherDeadlineCards } from "./TeacherDeadlineCards";
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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Добрый день, {data.teacherName}
          </h1>
          <p className="mt-1 text-base text-gray-500">
            {data.stats.pendingReviewCount > 0
              ? `Сегодня у вас ${data.stats.pendingReviewCount} работ на проверке.`
              : "Всё проверено — новых работ нет."}
          </p>
        </div>

        <Button
          asChild
          className="gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <Link href="/dashboard/teacher/homework/create">
            <Plus className="h-4 w-4" />
            Создать ДЗ
          </Link>
        </Button>
      </motion.div>

      <TeacherDeadlineCards deadlines={data.upcomingDeadlines} />

      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
        <div className="flex flex-col gap-6">
          <TeacherHomeworkSection reviews={data.reviews} />
          <TeacherActivityFeed events={data.activityEvents} />
        </div>

        <div className="flex flex-col gap-6">
          <TeacherClassesSection classes={data.classes} />
          <TeacherQuickActions />
        </div>
      </div>
    </div>
  );
};
