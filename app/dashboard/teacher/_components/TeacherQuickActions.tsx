"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, UserPlus, BookOpen } from "lucide-react";

const QUICK_ACTIONS = [
  {
    id: "homework",
    icon: FileText,
    label: "Создать ДЗ",
    description: "Назначьте задание классу",
    href: "/dashboard/teacher/homework/create",
  },
  {
    id: "student",
    icon: UserPlus,
    label: "Добавить ученика",
    description: "Пригласите в класс",
    href: "/dashboard/teacher/classes",
  },
  {
    id: "tasks",
    icon: BookOpen,
    label: "Банк задач",
    description: "Задачи по темам",
    href: "/dashboard/teacher/tasks",
  },
];

export const TeacherQuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="rounded border border-gray-200 bg-white"
    >
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <h2 className="text-[16px] font-semibold text-gray-900">Быстрые действия</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.06 }}
            >
              <Link
                href={action.href}
                className="flex flex-col items-center gap-2 rounded border border-gray-200 p-4 text-center transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-[13px] font-semibold leading-tight text-gray-800">
                  {action.label}
                </p>
                <p className="text-[12px] leading-tight text-gray-400">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
