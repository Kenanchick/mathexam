"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, ChevronRight, ChevronLeft, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathText } from "./MathText";
import type { TheoryQuizDetail } from "../_lib/getTheoryQuizzes";

interface Props {
  slug: string;
  onClose: () => void;
}

type Phase = "loading" | "quiz" | "result";

const TYPE_LABELS = {
  FORMULA_RECALL: "Формула",
  CALCULATION: "Вычисление",
  THEORETICAL: "Теория",
};

export function QuizModal({ slug, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<TheoryQuizDetail | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    fetch(`/api/theory/${slug}`)
      .then((r) => r.json())
      .then((data: TheoryQuizDetail) => {
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
        setPhase("quiz");
      })
      .catch(() => onClose());
  }, [slug, onClose]);

  const question = quiz?.questions[currentIdx];
  const totalQuestions = quiz?.questions.length ?? 0;
  const isLast = currentIdx === totalQuestions - 1;

  const handleSelect = useCallback(
    (idx: number) => { if (!confirmed) setSelected(idx); },
    [confirmed],
  );

  const handleConfirm = useCallback(() => {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = selected;
    setAnswers(newAnswers);
    setConfirmed(true);
  }, [selected, answers, currentIdx]);

  const handleNext = useCallback(() => {
    if (isLast) { setPhase("result"); }
    else {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    }
  }, [isLast]);

  const handlePrev = useCallback(() => {
    if (currentIdx === 0) return;
    setCurrentIdx((i) => i - 1);
    setSelected(answers[currentIdx - 1]);
    setConfirmed(answers[currentIdx - 1] !== null);
  }, [currentIdx, answers]);

  const handleRestart = useCallback(() => {
    setCurrentIdx(0);
    setSelected(null);
    setConfirmed(false);
    setAnswers(new Array(totalQuestions).fill(null));
    setPhase("quiz");
  }, [totalQuestions]);

  const correctCount =
    quiz?.questions.filter((q, i) => answers[i] === q.correctIndex).length ?? 0;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded border border-gray-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-gray-900 text-xs font-bold text-white">
              {quiz?.examNumber ?? "—"}
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-tight text-gray-900">
                {quiz?.topicTitle ?? "Загрузка..."}
              </p>
              {phase === "quiz" && (
                <p className="text-[12px] text-gray-400">
                  Вопрос {currentIdx + 1} из {totalQuestions}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        {phase === "quiz" && totalQuestions > 0 && (
          <div className="h-[3px] bg-gray-100">
            <motion.div
              className="h-full bg-gray-900"
              initial={false}
              animate={{ width: `${((currentIdx + (confirmed ? 1 : 0)) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {phase === "loading" && (
            <div className="flex items-center justify-center py-24">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </div>
          )}

          {/* Quiz */}
          {phase === "quiz" && question && (
            <div className="px-6 py-5">
              {/* Question type badge */}
              <span className="mb-4 inline-block rounded-sm bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                {TYPE_LABELS[question.type]}
              </span>

              {/* Question text */}
              <p className="mb-6 text-[15px] font-medium leading-relaxed text-gray-900">
                <MathText text={question.question} />
              </p>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === question.correctIndex;

                  let style = "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50";
                  if (confirmed) {
                    if (isCorrect) style = "border-emerald-300 bg-emerald-50 text-emerald-800";
                    else if (isSelected) style = "border-red-300 bg-red-50 text-red-800";
                    else style = "border-gray-100 bg-gray-50 text-gray-400";
                  } else if (isSelected) {
                    style = "border-gray-900 bg-gray-900 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded border px-4 py-3 text-left text-[14px] transition-all",
                        style,
                        confirmed ? "cursor-default" : "cursor-pointer",
                      )}
                    >
                      <span className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold",
                        confirmed && isCorrect
                          ? "bg-emerald-200 text-emerald-700"
                          : confirmed && isSelected && !isCorrect
                            ? "bg-red-200 text-red-700"
                            : isSelected
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-500",
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1"><MathText text={option} /></span>
                      {confirmed && isCorrect && (
                        <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      {confirmed && isSelected && !isCorrect && (
                        <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {confirmed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded border border-gray-200 bg-gray-50 p-4">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Объяснение
                      </p>
                      <p className="text-[13px] leading-relaxed text-gray-700">
                        <MathText text={question.explanation} />
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Result */}
          {phase === "result" && quiz && (
            <div className="px-6 py-8">
              {/* Score */}
              <div className="mb-6 text-center">
                <div className={cn(
                  "mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded border text-[28px] font-bold",
                  scorePercent >= 80
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : scorePercent >= 50
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-red-200 bg-red-50 text-red-700",
                )}>
                  {scorePercent}%
                </div>
                <h2 className="text-[18px] font-bold text-gray-900">
                  {scorePercent >= 80 ? "Отлично!" : scorePercent >= 50 ? "Неплохо" : "Нужно повторить"}
                </h2>
                <p className="mt-1 text-[13px] text-gray-500">
                  {correctCount} из {totalQuestions} верно
                </p>
              </div>

              {/* Per-question breakdown */}
              <div className="mb-6 space-y-2">
                {quiz.questions.map((q, i) => {
                  const isCorrect = answers[i] === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-start gap-3 rounded border px-4 py-3",
                        isCorrect ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50",
                      )}
                    >
                      {isCorrect
                        ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      }
                      <div>
                        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-gray-700">
                          <MathText text={q.question} />
                        </p>
                        {!isCorrect && (
                          <p className="mt-0.5 text-[12px] text-gray-500">
                            Верный:{" "}
                            <span className="font-medium text-emerald-700">
                              <MathText text={q.options[q.correctIndex]} />
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 rounded bg-gray-900 px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Пройти ещё раз
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === "quiz" && question && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3.5">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </button>

            {!confirmed ? (
              <button
                onClick={handleConfirm}
                disabled={selected === null}
                className="rounded bg-gray-900 px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
              >
                Проверить
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 rounded bg-gray-900 px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                {isLast ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Завершить
                  </>
                ) : (
                  <>
                    Следующий
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
