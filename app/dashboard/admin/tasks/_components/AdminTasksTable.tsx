"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { AdminTaskListItem } from "../_lib/getAdminTasks";

const statusLabels: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Черновик", cls: "bg-amber-50 text-amber-700" },
  PUBLISHED: { label: "Опубликовано", cls: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "В архиве", cls: "bg-gray-100 text-gray-600" },
};

const difficultyLabels: Record<string, string> = {
  EASY: "Лёгкая",
  MEDIUM: "Средняя",
  HARD: "Сложная",
};

export function AdminTasksTable({ tasks }: { tasks: AdminTaskListItem[] }) {
  const [search, setSearch] = useState("");
  const [examNumber, setExamNumber] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const numbers = useMemo(
    () =>
      Array.from(new Set(tasks.map((t) => t.examNumber))).sort((a, b) => a - b),
    [tasks],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (examNumber !== "all" && t.examNumber !== Number(examNumber))
        return false;
      if (q.length === 0) return true;
      return (
        (t.title?.toLowerCase().includes(q) ?? false) ||
        t.topic.toLowerCase().includes(q) ||
        (t.subtopic?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tasks, search, examNumber, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию, теме, подтеме"
          className="min-w-[260px] flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        />
        <select
          value={examNumber}
          onChange={(e) => setExamNumber(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Все номера</option>
          {numbers.map((n) => (
            <option key={n} value={n}>
              Задание {n}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">Все статусы</option>
          <option value="DRAFT">Черновик</option>
          <option value="PUBLISHED">Опубликовано</option>
          <option value="ARCHIVED">В архиве</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">№</th>
              <th className="px-4 py-3">Заголовок</th>
              <th className="px-4 py-3">Тема / Подтема</th>
              <th className="px-4 py-3">Сложность</th>
              <th className="px-4 py-3">Картинки</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  По выбранным фильтрам задач не найдено.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const st = statusLabels[t.status];
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{t.examNumber}</td>
                    <td className="px-4 py-3 text-gray-900">
                      {t.title ?? <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div>{t.topic}</div>
                      {t.subtopic && (
                        <div className="text-xs text-gray-500">
                          {t.subtopic}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {difficultyLabels[t.difficulty]}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {t.hasImages ? "✓" : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/tasks/${t.id}/edit`}
                        className="text-sm font-medium text-gray-900 hover:underline"
                      >
                        Редактировать
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-500">
        Найдено: {filtered.length} из {tasks.length}
      </div>
    </div>
  );
}
