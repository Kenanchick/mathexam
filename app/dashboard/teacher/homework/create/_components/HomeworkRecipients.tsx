"use client";

import { useMemo, useState } from "react";
import { Users, UserCheck, UserPlus, Search, School, X } from "lucide-react";
import type { ClassroomOption, AllStudentOption } from "../_lib/getCreateHomeworkData";

export type RecipientMode = "all" | "selected" | "personal";

interface HomeworkRecipientsProps {
  classroomId: string;
  classrooms: ClassroomOption[];
  allStudents: AllStudentOption[];
  mode: RecipientMode;
  selectedStudentIds: string[];
  onModeChange: (mode: RecipientMode) => void;
  onStudentToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const MODES = [
  {
    id: "all" as const,
    label: "Всему классу",
    description: "ДЗ получат все ученики выбранного класса",
    icon: Users,
  },
  {
    id: "selected" as const,
    label: "Выбранным из класса",
    description: "Выберите учеников внутри одного класса",
    icon: UserCheck,
  },
  {
    id: "personal" as const,
    label: "Лично выбранным",
    description: "Любые ученики из любых классов",
    icon: UserPlus,
  },
];

export const HomeworkRecipients = ({
  classroomId,
  classrooms,
  allStudents,
  mode,
  selectedStudentIds,
  onModeChange,
  onStudentToggle,
  onSelectAll,
  onDeselectAll,
}: HomeworkRecipientsProps) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");

  const classroom = classrooms.find((c) => c.id === classroomId);
  const classStudents = classroom?.students ?? [];

  const filteredAll = useMemo(() => {
    return allStudents.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (s.name ?? "").toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchClass = classFilter === "all" || s.classroomId === classFilter;
      return matchSearch && matchClass;
    });
  }, [allStudents, search, classFilter]);

  const selectedDetails = useMemo(
    () => allStudents.filter((s) => selectedStudentIds.includes(s.id)),
    [allStudents, selectedStudentIds],
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">Кому назначить</h2>

      {/* Mode selector */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {MODES.map(({ id, label, description, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onModeChange(id)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-gray-800 bg-gray-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-gray-900" : "text-gray-400"}`} />
              <span className={`text-base font-semibold ${active ? "text-gray-900" : "text-gray-700"}`}>
                {label}
              </span>
              <span className="text-sm text-gray-400">{description}</span>
            </button>
          );
        })}
      </div>

      {/* Mode: All */}
      {mode === "all" && (
        <>
          {!classroomId ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
              Сначала выберите класс в блоке выше.
            </p>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-700">
              ДЗ будет назначено всем{" "}
              <span className="font-semibold text-gray-900">{classStudents.length}</span>{" "}
              {pluralStudents(classStudents.length)} класса.
            </div>
          )}
        </>
      )}

      {/* Mode: Selected from class */}
      {mode === "selected" && (
        <>
          {!classroomId ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
              Сначала выберите класс в блоке выше.
            </p>
          ) : classStudents.length === 0 ? (
            <p className="text-sm text-gray-400">В классе пока нет учеников.</p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base text-gray-500">
                  Выбрано:{" "}
                  <span className="font-semibold text-gray-900">{selectedStudentIds.length}</span>{" "}
                  из {classStudents.length}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Выбрать всех
                  </button>
                  <button
                    type="button"
                    onClick={onDeselectAll}
                    className="text-sm font-medium text-gray-400 hover:text-gray-600"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {classStudents.map((s) => {
                  const checked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
                        checked
                          ? "border-gray-800 bg-gray-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onStudentToggle(s.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                      />
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                        {(s.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-base font-medium text-gray-800">
                        {s.name ?? "Ученик"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Mode: Personal — pick across all classes */}
      {mode === "personal" && (
        <>
          {allStudents.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
              У вас пока нет учеников ни в одном классе.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Selected chips */}
              {selectedDetails.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Выбрано: {selectedDetails.length}
                    </span>
                    <button
                      type="button"
                      onClick={onDeselectAll}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600"
                    >
                      Очистить
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetails.map((s) => (
                      <span
                        key={s.id}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-sm text-gray-800"
                      >
                        {s.name ?? "Ученик"}
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{s.classroomTitle}</span>
                        <button
                          type="button"
                          onClick={() => onStudentToggle(s.id)}
                          className="ml-0.5 text-gray-400 hover:text-gray-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Search + filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по имени или email..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                  />
                </div>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="h-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-base text-gray-700 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  >
                    <option value="all">Все классы</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                {filteredAll.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    Никого не найдено
                  </p>
                ) : (
                  filteredAll.map((s, idx) => {
                    const checked = selectedStudentIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors ${
                          checked ? "bg-gray-50" : "hover:bg-gray-50"
                        } ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onStudentToggle(s.id)}
                          className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                        />
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                          {(s.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-medium text-gray-900">
                            {s.name ?? "Ученик"}
                          </p>
                          <p className="truncate text-xs text-gray-400">{s.email}</p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                          <School className="h-3 w-3" />
                          {s.classroomTitle}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function pluralStudents(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return "ученику";
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "ученикам";
  return "ученикам";
}
