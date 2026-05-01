"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target,
  Zap,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamMap } from "./ExamMap";
import { ActivityChart } from "./ActivityChart";
import type { ProgressData } from "../_lib/progressTypes";

/* ── helpers ──────────────────────────────────────────── */

function scoreColor(s: number) {
  if (s >= 70) return "text-emerald-600";
  if (s >= 50) return "text-amber-600";
  return "text-red-500";
}
function scoreBarColor(s: number) {
  if (s >= 70) return "bg-emerald-400";
  if (s >= 50) return "bg-amber-400";
  return "bg-red-400";
}
function scoreLabel(s: number, solved: number) {
  if (solved === 0) return "Нет данных";
  if (s >= 80) return "Отлично";
  if (s >= 65) return "Хорошо";
  if (s >= 50) return "Достаточно";
  if (s >= 27) return "Ниже минимума";
  return "Ниже порога";
}

function topicBarColor(acc: number) {
  if (acc >= 55) return "bg-amber-400";
  return "bg-red-400";
}
function topicTextColor(acc: number) {
  if (acc >= 55) return "text-amber-600";
  return "text-red-500";
}

/* ── Stat card ────────────────────────────────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}
const StatCard = ({ icon, label, value, sub, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.26, delay }}
    className="rounded border border-gray-200 bg-white px-5 py-4"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] text-gray-500">{label}</p>
        <p className="mt-1 text-[28px] font-bold leading-none text-gray-900">{value}</p>
        {sub && <p className="mt-1 text-[12px] text-gray-400">{sub}</p>}
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
        {icon}
      </div>
    </div>
  </motion.div>
);

/* ── Main ─────────────────────────────────────────────── */

export const ProgressPage = ({ data }: { data: ProgressData }) => {
  const sec = data.predictedSecondary;
  const hasSolved = data.totalSolved > 0;

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-5">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">Прогресс</h1>
        <p className="mt-1 text-[16px] text-gray-500">Ваши результаты по подготовке к ЕГЭ</p>
      </div>

      {/* ── Row 1: 4 stats ── */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Predicted score */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0 }}
          className="rounded border border-gray-200 bg-white px-5 py-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-500">Прогноз балла ЕГЭ</p>
              <p className={cn("mt-1 text-[32px] font-bold leading-none", hasSolved ? scoreColor(sec) : "text-gray-300")}>
                {hasSolved ? sec : "—"}
              </p>
              <p className={cn("mt-1 text-[12px] font-medium", hasSolved ? scoreColor(sec) : "text-gray-400")}>
                {scoreLabel(sec, data.totalSolved)}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
              <Target className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          {hasSolved && (
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-gray-400">Первичных баллов</span>
                <span className="text-[11px] font-medium text-gray-600">
                  {data.predictedPrimary} / 32
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-sm bg-gray-100">
                <motion.div
                  className={cn("h-full rounded-sm", scoreBarColor(sec))}
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.predictedPrimary / 32) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-gray-500" />}
          label="Верных ответов"
          value={data.totalSolved}
          sub={hasSolved ? `Точность ${data.accuracyPercent}%` : "Пока нет попыток"}
          delay={0.06}
        />
        <StatCard
          icon={<Zap className="h-4 w-4 text-gray-500" />}
          label="Серия дней"
          value={data.streak}
          sub={data.streak > 0 ? "Так держать!" : "Начните сегодня"}
          delay={0.12}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-gray-500" />}
          label="Типов заданий"
          value={`${data.examStats.filter((s) => s.attempts > 0).length} / 19`}
          sub="Опробовано"
          delay={0.18}
        />
      </div>

      {/* ── Row 2: Weak topics (full-width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.22 }}
        className="mb-5 rounded border border-gray-200 bg-white"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900">Слабые темы</h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Темы где точность ниже 70% — здесь стоит сосредоточиться
              </p>
            </div>
            {data.weakTopics.length > 0 && (
              <span className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[13px] font-medium text-red-600">
                {data.weakTopics.length} {data.weakTopics.length === 1 ? "тема" : data.weakTopics.length <= 4 ? "темы" : "тем"}
              </span>
            )}
          </div>
        </div>

        {data.weakTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-5 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded border border-emerald-200 bg-emerald-50">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-[15px] font-semibold text-gray-700">
              {hasSolved ? "Слабых тем нет — отличная работа!" : "Пока нет данных"}
            </p>
            <p className="text-[13px] text-gray-400">
              {hasSolved
                ? "Все изученные темы выше порога 70%"
                : "Решите задачи, чтобы увидеть статистику по темам"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2 xl:grid-cols-4">
            {data.weakTopics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.28 + i * 0.04 }}
                className="bg-white p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold leading-snug text-gray-900">
                    {topic.title}
                  </p>
                  <span className={cn(
                    "shrink-0 text-[20px] font-bold leading-none",
                    topicTextColor(topic.accuracyPercent),
                  )}>
                    {topic.accuracyPercent}%
                  </span>
                </div>

                {/* Bar: accuracy vs 70% threshold */}
                <div className="relative mb-3">
                  <div className="h-2 w-full overflow-hidden rounded-sm bg-gray-100">
                    <motion.div
                      className={cn("h-full rounded-sm", topicBarColor(topic.accuracyPercent))}
                      initial={{ width: 0 }}
                      animate={{ width: `${topic.accuracyPercent}%` }}
                      transition={{ duration: 0.55, delay: 0.32 + i * 0.04, ease: "easeOut" }}
                    />
                  </div>
                  {/* 70% marker */}
                  <div
                    className="absolute top-0 h-2 w-px bg-gray-400"
                    style={{ left: "70%" }}
                    title="Порог 70%"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-gray-400">
                    {topic.correctCount} из {topic.solvedCount} верно
                  </p>
                  <Link
                    href={`/dashboard/student/tasks?topic=${encodeURIComponent(topic.title)}`}
                    className="flex items-center gap-1 text-[12px] font-medium text-gray-500 transition hover:text-gray-900"
                  >
                    <BookOpen className="h-3 w-3" />
                    Порешать
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Row 3: Activity + Exam map ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.32 }}
        className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_auto]"
      >
        <ActivityChart dailyActivity={data.dailyActivity} streak={data.streak} />

        <div className="min-w-0 xl:w-[460px]">
          <ExamMap
            examStats={data.examStats}
            predictedPrimary={data.predictedPrimary}
            predictedSecondary={data.predictedSecondary}
          />
        </div>
      </motion.div>
    </div>
  );
};
