"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeacherStatsCards } from "./TeacherStatsCards";
import { TeacherHomeworkSection } from "./TeacherHomeworkSection";
import { TeacherClassesSection } from "./TeacherClassesSection";
import { TeacherActivityFeed } from "./TeacherActivityFeed";
import { TeacherQuickActions } from "./TeacherQuickActions";
import type { TeacherStat } from "../_lib/teacherDashboardTypes";
import type { TeacherDashboardData } from "../_lib/getTeacherDashboardData";

function buildStats(data: TeacherDashboardData): TeacherStat[] {
  const { stats } = data;
  return [
    {
      id: "students",
      title: "Активных учеников",
      value: String(stats.totalStudentsCount),
      subtitle:
        stats.activeClassesCount > 0
          ? `В ${stats.activeClassesCount} классах`
          : "Нет учеников",
      trend: "neutral",
      variant: "blue",
    },
    {
      id: "classes",
      title: "Классов",
      value: String(stats.activeClassesCount),
      subtitle: stats.activeClassesCount > 0 ? "Активных" : "Нет классов",
      trend: "neutral",
      variant: "green",
    },
    {
      id: "reviews",
      title: "Работ на проверке",
      value: String(stats.pendingReviewCount),
      subtitle:
        stats.pendingReviewCount > 0 ? "Требуют проверки" : "Всё проверено",
      trend: stats.pendingReviewCount > 0 ? "up" : "neutral",
      variant: "orange",
    },
    {
      id: "avg",
      title: "Средний результат",
      value: stats.avgScorePercent > 0 ? `${stats.avgScorePercent}%` : "—",
      subtitle:
        stats.avgScorePercent > 0 ? "По проверенным работам" : "Нет данных",
      trend: "neutral",
      variant: "purple",
    },
  ];
}

interface TeacherDashboardPageProps {
  data: TeacherDashboardData;
}

export const TeacherDashboardPage = ({ data }: TeacherDashboardPageProps) => {
  const stats = buildStats(data);

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
          <Link href="/dashboard/teacher/homework/new">
            <Plus className="h-4 w-4" />
            Создать ДЗ
          </Link>
        </Button>
      </motion.div>

      <TeacherStatsCards stats={stats} />

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
