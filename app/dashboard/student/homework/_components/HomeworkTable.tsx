"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HomeworkStatusBadge } from "./HomeworkStatusBadge";
import { HomeworkProgress } from "./HomeworkProgress";
import type { HomeworkItemView } from "../_lib/getHomeworkData";

interface HomeworkTableProps {
  items: HomeworkItemView[];
}

const actionLabel: Record<HomeworkItemView["status"], string> = {
  new: "Начать",
  in_progress: "Продолжить",
  submitted: "Смотреть результат",
  overdue: "Продолжить",
};

export const HomeworkTable = ({ items }: HomeworkTableProps) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
        <p className="text-sm text-gray-400">Заданий в этой категории нет</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Название",
                "Учитель",
                "Кол-во задач",
                "Дедлайн",
                "Прогресс",
                "Статус",
                "Действие",
              ].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3.5 text-left text-xs font-medium text-gray-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {items.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, delay: i * 0.04 }}
                  className="group border-b border-gray-50 transition-all last:border-0 hover:bg-blue-50/40"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold leading-snug text-gray-900">
                      {item.title}
                    </p>
                    {item.status === "submitted" && item.submittedDate && (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Сдано {item.submittedDate}
                      </p>
                    )}
                    {item.status === "overdue" && (
                      <p className="mt-0.5 text-xs text-red-500">
                        {item.deadline} (просрочено)
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.teacher}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.tasksTotal} задач
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        item.status === "overdue"
                          ? "text-sm text-red-500"
                          : "text-sm text-gray-600"
                      }
                    >
                      {item.deadline}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <HomeworkProgress
                      completed={item.tasksCompleted}
                      total={item.tasksTotal}
                      overdue={item.status === "overdue"}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <HomeworkStatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/student/homework/${item.id}`}
                      className="inline-block rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md group-hover:border-blue-200"
                    >
                      {actionLabel[item.status]}
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 px-5 py-3">
        <p className="text-xs text-gray-400">
          Показано {items.length} из {items.length}{" "}
          {items.length === 1 ? "задания" : "заданий"}
        </p>
      </div>
    </div>
  );
};
