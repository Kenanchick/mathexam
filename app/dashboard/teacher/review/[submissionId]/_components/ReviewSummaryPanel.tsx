"use client";

import { motion } from "framer-motion";
import { AlertCircle, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertPrimaryToTestScore } from "../_lib/egeScoring";

interface ReviewSummaryPanelProps {
  part1Score: number;
  part1Max: number;
  part2Score: number;
  part2Max: number;
  isVariant: boolean;
  overallComment: string;
  onCommentChange: (v: string) => void;
  canSubmit: boolean;
  onSaveDraft: () => void;
  onSubmit: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  uncheckedCount: number;
}

export const ReviewSummaryPanel = ({
  part1Score,
  part1Max,
  part2Score,
  part2Max,
  isVariant,
  overallComment,
  onCommentChange,
  canSubmit,
  onSaveDraft,
  onSubmit,
  saveStatus,
  uncheckedCount,
}: ReviewSummaryPanelProps) => {
  const totalPrimary = part1Score + part2Score;
  const totalMax = part1Max + part2Max;
  const testScore = convertPrimaryToTestScore(totalPrimary);
  const percent = totalMax > 0 ? Math.round((totalPrimary / totalMax) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="sticky top-4 flex flex-col gap-4"
    >
      {/* Score breakdown */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-gray-900">Итог проверки</h3>

        <div className="flex flex-col gap-3">
          {part1Max > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Часть 1 (1–12)</span>
              <span className="text-sm font-semibold text-gray-800">
                {part1Score} / {part1Max}
              </span>
            </div>
          )}
          {part2Max > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Часть 2 (13–19)</span>
              <span className="text-sm font-semibold text-gray-800">
                {part2Score} / {part2Max}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm font-semibold text-gray-700">Первичный балл</span>
            <span className="text-lg font-bold text-gray-900">
              {totalPrimary} / {totalMax}
            </span>
          </div>
          {isVariant && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
              <span className="text-sm font-medium text-blue-700">Тестовый балл ЕГЭ</span>
              <span className="text-2xl font-bold text-blue-700">{testScore}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs text-gray-400">{percent}%</p>
        </div>
      </div>

      {/* Overall comment */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-gray-900">
          Общий комментарий ученику
        </label>
        <textarea
          value={overallComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Напишите общий отзыв о работе..."
          rows={4}
          className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-blue-300 focus:bg-white"
        />
      </div>

      {/* Warning */}
      {uncheckedCount > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
          <p className="text-sm text-orange-700">
            Не проверено: {uncheckedCount}{" "}
            {uncheckedCount === 1 ? "задание" : uncheckedCount <= 4 ? "задания" : "заданий"}.
            Выставьте баллы, чтобы отправить результат.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || saveStatus === "saving"}
          className="w-full gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {saveStatus === "saving" ? "Отправка..." : "Отправить результат ученику"}
        </Button>
        <Button
          onClick={onSaveDraft}
          disabled={saveStatus === "saving"}
          variant="outline"
          className="w-full gap-2 rounded-xl"
        >
          <Save className="h-4 w-4" />
          {saveStatus === "saved" ? "Сохранено ✓" : "Сохранить черновик"}
        </Button>
        {saveStatus === "error" && (
          <p className="text-center text-xs text-red-500">Ошибка при сохранении</p>
        )}
      </div>
    </motion.div>
  );
};
