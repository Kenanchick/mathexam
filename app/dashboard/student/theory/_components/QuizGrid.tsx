"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TheoryQuizSummary } from "../_lib/getTheoryQuizzes";
import { QuizModal } from "./QuizModal";

const POINTS: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1,
  7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1,
  13: 2, 14: 2, 15: 2, 16: 3, 17: 3, 18: 4, 19: 4,
};

interface Props {
  quizzes: TheoryQuizSummary[];
}

export function QuizGrid({ quizzes }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "part1" | "part2">("all");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const filtered = quizzes.filter((q) => {
    if (activeFilter === "part1") return q.examNumber <= 12;
    if (activeFilter === "part2") return q.examNumber > 12;
    return true;
  });

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-2">
        {(["all", "part1", "part2"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-medium transition-all",
              activeFilter === f
                ? "bg-gray-900 text-white"
                : "border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {f === "all" ? "Все" : f === "part1" ? "Часть 1 · 1–12" : "Часть 2 · 13–19"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400">{filtered.length} тем</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((quiz, i) => {
          const isPart2 = quiz.examNumber > 12;
          const pts = POINTS[quiz.examNumber] ?? 1;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.025 }}
            >
              <button
                onClick={() => setOpenSlug(quiz.topicSlug)}
                className={cn(
                  "group relative w-full overflow-hidden rounded border text-left transition-all",
                  "border-gray-200 bg-white hover:bg-gray-50",
                  isPart2 ? "border-t-gray-700 border-t-2" : "border-t-gray-300 border-t-2",
                )}
              >
                {/* Watermark number */}
                <span
                  className="pointer-events-none absolute bottom-0 right-2 select-none font-black leading-none text-gray-900"
                  style={{ fontSize: 80, lineHeight: 1, opacity: 0.045 }}
                  aria-hidden
                >
                  {quiz.examNumber}
                </span>

                <div className="relative px-5 py-5">
                  {/* Top row: number pill + points */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className={cn(
                      "inline-flex items-center rounded-sm px-2.5 py-0.5 text-[12px] font-bold tracking-wide",
                      isPart2
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-500",
                    )}>
                      № {quiz.examNumber}
                    </span>
                    <span className="text-[12px] font-medium text-gray-300">
                      {pts === 1 ? "1 балл" : `до ${pts} баллов`}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="mb-1.5 text-[15px] font-semibold leading-snug text-gray-900">
                    {quiz.topicTitle}
                  </p>

                  {quiz.description && (
                    <p className="mb-5 line-clamp-2 text-[13px] leading-relaxed text-gray-400">
                      {quiz.description}
                    </p>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[13px] text-gray-400">
                      <BookOpen className="h-3.5 w-3.5" />
                      {quiz.questionCount} вопросов
                    </span>
                    <span className="flex items-center gap-1 text-[13px] font-medium text-gray-400 transition-colors group-hover:text-gray-700">
                      Начать
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">Тесты ещё не сгенерированы</p>
          <p className="mt-1 text-xs text-gray-300">Запустите: npm run generate-theory</p>
        </div>
      )}

      {openSlug && (
        <QuizModal slug={openSlug} onClose={() => setOpenSlug(null)} />
      )}
    </>
  );
}
