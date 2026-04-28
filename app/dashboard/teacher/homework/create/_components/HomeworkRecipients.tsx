"use client";

import { Users, UserCheck, Layers } from "lucide-react";
import type { ClassroomOption } from "../_lib/getCreateHomeworkData";

export type RecipientMode = "all" | "selected" | "individual";

interface HomeworkRecipientsProps {
  classroomId: string;
  classrooms: ClassroomOption[];
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
    description: "ДЗ получат все ученики класса",
    icon: Users,
  },
  {
    id: "selected" as const,
    label: "Выбранным ученикам",
    description: "Выберите конкретных учеников",
    icon: UserCheck,
  },
  {
    id: "individual" as const,
    label: "Индивидуальные наборы",
    description: "Разные задачи для разных групп",
    icon: Layers,
  },
];

export const HomeworkRecipients = ({
  classroomId,
  classrooms,
  mode,
  selectedStudentIds,
  onModeChange,
  onStudentToggle,
  onSelectAll,
  onDeselectAll,
}: HomeworkRecipientsProps) => {
  const classroom = classrooms.find((c) => c.id === classroomId);
  const students = classroom?.students ?? [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Кому назначить
      </h2>

      {!classroomId && (
        <p className="text-sm text-gray-400">
          Сначала выберите класс в блоке выше.
        </p>
      )}

      {classroomId && (
        <>
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
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${active ? "text-blue-800" : "text-gray-700"}`}
                  >
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">{description}</span>
                </button>
              );
            })}
          </div>

          {mode === "all" && (
            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              ДЗ будет назначено всем{" "}
              <span className="font-semibold">{students.length}</span>{" "}
              {pluralStudents(students.length)} класса.
            </div>
          )}

          {mode === "selected" && (
            <div>
              {students.length === 0 ? (
                <p className="text-sm text-gray-400">В классе пока нет учеников.</p>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Выбрано:{" "}
                      <span className="font-semibold text-gray-800">
                        {selectedStudentIds.length}
                      </span>{" "}
                      из {students.length}
                    </span>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onSelectAll}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        Выбрать всех
                      </button>
                      <button
                        type="button"
                        onClick={onDeselectAll}
                        className="text-xs font-medium text-gray-400 hover:text-gray-600"
                      >
                        Сбросить
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {students.map((s) => {
                      const checked = selectedStudentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors ${
                            checked
                              ? "border-blue-300 bg-blue-50"
                              : "border-gray-200 bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onStudentToggle(s.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                          />
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {(s.name ?? "?").charAt(0)}
                          </div>
                          <span className="truncate text-sm font-medium text-gray-800">
                            {s.name ?? "Ученик"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {mode === "individual" && (
            <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 px-5 py-4">
              <p className="text-sm font-semibold text-orange-700">
                Индивидуальные наборы
              </p>
              <p className="mt-1 text-sm text-orange-600">
                Возможность назначать разные задачи разным ученикам будет
                доступна в следующей версии. Сейчас ДЗ будет назначено всему
                классу с одним набором задач.
              </p>
              {/* TODO: implement per-student task sets */}
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
