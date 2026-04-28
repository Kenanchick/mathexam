"use client";

import type { ClassroomOption } from "../_lib/getCreateHomeworkData";

interface HomeworkBasicInfoProps {
  title: string;
  description: string;
  classroomId: string;
  deadlineDate: string;
  deadlineTime: string;
  classrooms: ClassroomOption[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onClassroomChange: (v: string) => void;
  onDeadlineDateChange: (v: string) => void;
  onDeadlineTimeChange: (v: string) => void;
}

export const HomeworkBasicInfo = ({
  title,
  description,
  classroomId,
  deadlineDate,
  deadlineTime,
  classrooms,
  onTitleChange,
  onDescriptionChange,
  onClassroomChange,
  onDeadlineDateChange,
  onDeadlineTimeChange,
}: HomeworkBasicInfoProps) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-gray-900">
        Основная информация
      </h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Название <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Например: Домашнее задание по тригонометрии"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Комментарий для учеников{" "}
            <span className="font-normal text-gray-400">(необязательно)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            placeholder="Что нужно знать перед выполнением, особые условия..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Класс <span className="text-red-500">*</span>
          </label>
          {classrooms.length === 0 ? (
            <p className="text-sm text-gray-400">
              У вас пока нет классов.{" "}
              <a
                href="/dashboard/teacher/classes"
                className="text-blue-600 hover:underline"
              >
                Создать класс
              </a>
            </p>
          ) : (
            <select
              value={classroomId}
              onChange={(e) => onClassroomChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="">— Выберите класс —</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Дедлайн <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => onDeadlineDateChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Время <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => onDeadlineTimeChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
