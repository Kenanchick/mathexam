"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MAX_PRIMARY, EXAM_POINTS, type ExamStat } from "../_lib/progressTypes";

function cellStyle(stat: ExamStat): {
  container: string;
  label: string;
  bar: string;
} {
  if (stat.attempts === 0) {
    return {
      container: "border-gray-200 bg-white hover:bg-gray-50",
      label: "text-gray-300",
      bar: "bg-gray-100",
    };
  }
  if (stat.accuracyPercent >= 75) {
    return {
      container: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60",
      label: "text-emerald-700",
      bar: "bg-emerald-400",
    };
  }
  if (stat.accuracyPercent >= 50) {
    return {
      container: "border-amber-200 bg-amber-50 hover:bg-amber-100/60",
      label: "text-amber-700",
      bar: "bg-amber-400",
    };
  }
  return {
    container: "border-red-200 bg-red-50 hover:bg-red-100/60",
    label: "text-red-600",
    bar: "bg-red-400",
  };
}

interface ExamMapProps {
  examStats: ExamStat[];
  predictedPrimary: number;
  predictedSecondary: number;
}

export const ExamMap = ({ examStats, predictedPrimary, predictedSecondary }: ExamMapProps) => {
  const part1 = examStats.filter((s) => s.examNumber <= 12);
  const part2 = examStats.filter((s) => s.examNumber > 12);
  const scoreColor =
    predictedSecondary >= 70 ? "text-emerald-600" :
    predictedSecondary >= 50 ? "text-amber-600" :
    "text-red-500";

  return (
    <div className="rounded border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-gray-900">Карта заданий ЕГЭ</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Нажмите на задание, чтобы порешать задачи этого типа
            </p>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-gray-400">Прогноз первичных баллов</p>
            <p className={cn("text-[22px] font-bold", scoreColor)}>
              {predictedPrimary} <span className="text-[14px] font-medium text-gray-400">/ {MAX_PRIMARY}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Part 1 */}
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-gray-400">
            Часть 1 · задания 1–12 · краткий ответ · по 1 баллу
          </p>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {part1.map((stat, i) => {
              const styles = cellStyle(stat);
              return (
                <motion.div
                  key={stat.examNumber}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                >
                  <Link
                    href={`/dashboard/student/tasks?number=${stat.examNumber}`}
                    className={cn(
                      "flex flex-col items-center rounded border px-2 py-3 transition-colors",
                      styles.container,
                    )}
                  >
                    <span className="text-[11px] text-gray-400">{stat.examNumber}</span>
                    <span className={cn("mt-1 text-[15px] font-bold", styles.label)}>
                      {stat.attempts > 0 ? `${stat.accuracyPercent}%` : "—"}
                    </span>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-gray-100">
                      <motion.div
                        className={cn("h-full", styles.bar)}
                        initial={{ width: 0 }}
                        animate={{ width: stat.attempts > 0 ? `${stat.accuracyPercent}%` : "0%" }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.03, ease: "easeOut" }}
                      />
                    </div>
                    {stat.attempts > 0 && (
                      <span className="mt-1 text-[10px] text-gray-400">{stat.attempts} поп.</span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Part 2 */}
        <div>
          <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-gray-400">
            Часть 2 · задания 13–19 · развёрнутый ответ
          </p>
          <div className="grid grid-cols-7 gap-2">
            {part2.map((stat, i) => {
              const styles = cellStyle(stat);
              const maxPts = EXAM_POINTS[stat.examNumber] ?? 1;
              return (
                <motion.div
                  key={stat.examNumber}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.36 + i * 0.04 }}
                >
                  <Link
                    href={`/dashboard/student/tasks?number=${stat.examNumber}`}
                    className={cn(
                      "flex flex-col items-center rounded border px-2 py-3 transition-colors",
                      styles.container,
                    )}
                  >
                    <span className="text-[11px] text-gray-400">{stat.examNumber}</span>
                    <span className={cn("mt-1 text-[15px] font-bold", styles.label)}>
                      {stat.attempts > 0 ? `${stat.accuracyPercent}%` : "—"}
                    </span>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-sm bg-gray-100">
                      <motion.div
                        className={cn("h-full", styles.bar)}
                        initial={{ width: 0 }}
                        animate={{ width: stat.attempts > 0 ? `${stat.accuracyPercent}%` : "0%" }}
                        transition={{ duration: 0.5, delay: 0.4 + i * 0.04, ease: "easeOut" }}
                      />
                    </div>
                    <span className="mt-1 text-[10px] text-gray-400">
                      {stat.attempts > 0 ? `${stat.attempts} поп.` : `до ${maxPts} б.`}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 border-t border-gray-100 pt-3">
          <p className="text-[12px] text-gray-400">Точность:</p>
          {[
            { label: "Не решалось", dot: "bg-gray-200" },
            { label: "< 50%", dot: "bg-red-300" },
            { label: "50–74%", dot: "bg-amber-300" },
            { label: "≥ 75%", dot: "bg-emerald-400" },
          ].map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <span className={cn("h-2.5 w-2.5 rounded-sm", item.dot)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
