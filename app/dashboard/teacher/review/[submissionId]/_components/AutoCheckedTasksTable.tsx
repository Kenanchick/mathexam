"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import type { ReviewTaskItem } from "../_lib/getReviewData";

interface AutoCheckedTasksTableProps {
  tasks: ReviewTaskItem[];
}

export const AutoCheckedTasksTable = ({ tasks }: AutoCheckedTasksTableProps) => {
  const correctCount = tasks.filter((t) => t.answer?.result === "CORRECT").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Часть 1 — автопроверка</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {correctCount} из {tasks.length} верно
          </span>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Проверено системой
          </span>
        </div>
      </div>

      <div className="p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="pb-3 pr-4">№</th>
              <th className="pb-3 pr-4">Тема</th>
              <th className="pb-3 pr-4">Ответ ученика</th>
              <th className="pb-3 pr-4">Верный ответ</th>
              <th className="pb-3 pr-4">Результат</th>
              <th className="pb-3">Балл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasks.map((task) => {
              const result = task.answer?.result;
              const status =
                result === "CORRECT" ? "correct" : result === "WRONG" ? "wrong" : "none";

              return (
                <tr key={task.homeworkTaskId}>
                  <td className="py-2.5 pr-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600">
                      {task.examNumber}
                    </span>
                  </td>
                  <td className="max-w-[180px] py-2.5 pr-4">
                    <span className="line-clamp-1 text-xs text-gray-500">
                      {task.topicTitle}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {task.answer?.answer ? (
                      <span className="font-mono text-sm text-gray-800">
                        {task.answer.answer}
                      </span>
                    ) : (
                      <span className="text-xs italic text-gray-400">Нет ответа</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="font-mono text-sm text-gray-600">
                      {task.correctAnswer}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {status === "correct" && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Верно</span>
                      </div>
                    )}
                    {status === "wrong" && (
                      <div className="flex items-center gap-1 text-red-500">
                        <XCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Неверно</span>
                      </div>
                    )}
                    {status === "none" && (
                      <div className="flex items-center gap-1 text-gray-400">
                        <MinusCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">Не решено</span>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`font-semibold ${
                        status === "correct"
                          ? "text-emerald-600"
                          : status === "wrong"
                            ? "text-red-500"
                            : "text-gray-400"
                      }`}
                    >
                      {status === "correct" ? "1" : "0"}
                    </span>
                    <span className="text-xs text-gray-300"> / {task.maxPoints}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
