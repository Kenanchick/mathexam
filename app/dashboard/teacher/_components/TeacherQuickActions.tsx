"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, UserPlus, BookOpen } from "lucide-react";

const QUICK_ACTIONS = [
  {
    id: "homework",
    icon: FileText,
    label: "Создать домашнее задание",
    description: "Назначьте задание классу или ученикам",
    href: "/dashboard/teacher/homework/new",
    iconClass: "text-blue-600 bg-blue-50",
    hoverClass: "hover:border-blue-200 hover:bg-blue-50/60",
  },
  {
    id: "student",
    icon: UserPlus,
    label: "Добавить ученика",
    description: "Пригласите ученика в класс",
    href: "/dashboard/teacher/students/invite",
    iconClass: "text-emerald-600 bg-emerald-50",
    hoverClass: "hover:border-emerald-200 hover:bg-emerald-50/60",
  },
  {
    id: "tasks",
    icon: BookOpen,
    label: "Открыть банк задач",
    description: "Подберите задачи по теме и уровню",
    href: "/dashboard/teacher/tasks",
    iconClass: "text-orange-500 bg-orange-50",
    hoverClass: "hover:border-orange-200 hover:bg-orange-50/60",
  },
];

export const TeacherQuickActions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Быстрые действия
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4">
        {QUICK_ACTIONS.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.55 + index * 0.07 }}
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center transition-all ${action.hoverClass}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.iconClass}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  {action.label}
                </p>
                <p className="text-sm leading-tight text-gray-400">
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
