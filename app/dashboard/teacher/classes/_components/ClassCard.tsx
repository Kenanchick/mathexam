"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, BookOpen, ClipboardCheck, Copy, Check, ArrowRight } from "lucide-react";
import type { TeacherClassDetail } from "../_lib/getTeacherClassesData";

interface ClassCardProps {
  cls: TeacherClassDetail;
  index: number;
}

export const ClassCard = ({ cls, index }: ClassCardProps) => {
  const [copied, setCopied] = useState(false);

  const copyInviteCode = async () => {
    await navigator.clipboard.writeText(cls.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-gray-900">
            {cls.title}
          </h3>
          {cls.description && (
            <p className="mt-1 truncate text-sm text-gray-500">
              {cls.description}
            </p>
          )}
        </div>

        {cls.pendingReviews > 0 && (
          <span className="shrink-0 rounded-lg border border-gray-700 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {cls.pendingReviews} на проверке
          </span>
        )}
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm text-gray-500">Средний прогресс</span>
          <span className="text-sm font-semibold text-gray-800">
            {cls.avgProgress}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gray-700"
            initial={{ width: 0 }}
            animate={{ width: `${cls.avgProgress}%` }}
            transition={{ duration: 0.7, delay: 0.3 + index * 0.1, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-gray-500">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">Учеников</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {cls.studentCount}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-gray-500">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-xs">Заданий</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {cls.homeworkCount}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-gray-500">
            <ClipboardCheck className="h-3.5 w-3.5" />
            <span className="text-xs">Проверено</span>
          </div>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {cls.homeworkCount > 0
              ? `${Math.round(((cls.homeworkCount - cls.pendingReviews) / cls.homeworkCount) * 100)}%`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5">
        <span className="text-xs text-gray-400">Код приглашения:</span>
        <span className="flex-1 font-mono text-sm font-semibold tracking-widest text-gray-800">
          {cls.inviteCode}
        </span>
        <button
          onClick={copyInviteCode}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
          title="Скопировать код"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <Link
          href={`/dashboard/teacher/classes/${cls.id}`}
          className="flex items-center gap-1.5 text-base font-medium text-gray-700 transition-colors hover:text-gray-900"
        >
          Открыть класс
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};
