"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Lightbulb,
  Loader2,
  XCircle,
} from "lucide-react";
import type { TaskDetailView } from "../_lib/getTaskDetail";

type TaskInfoAsideProps = {
  task: TaskDetailView;
  attempts: TaskDetailView["attempts"];
};

type HintResponse = {
  message?: string;
  hint?: string | null;
  hintNumber?: number;
  totalHints?: number;
  hasNext?: boolean;
};

export const TaskInfoAside = ({ task, attempts }: TaskInfoAsideProps) => {
  const [hints, setHints] = useState<string[]>([]);
  const [hintMessage, setHintMessage] = useState("");
  const [hasNextHint, setHasNextHint] = useState(true);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const handleGetHint = async () => {
    try {
      setIsHintLoading(true);
      setHintMessage("");

      const res = await fetch(
        `/api/student/tasks/${task.id}/hint?index=${hints.length}`,
      );

      const contentType = res.headers.get("content-type");

      let result: HintResponse = {
        message: "Не удалось загрузить подсказку",
      };

      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        result = {
          message: "Сервер вернул ошибку. Посмотри терминал Next.js.",
        };
      }

      if (!res.ok) {
        setHintMessage(result.message || "Не удалось загрузить подсказку");
        return;
      }

      if (result.hint) {
        setHints((prev) => [...prev, result.hint as string]);
      }

      setHintMessage(result.message || "");
      setHasNextHint(result.hasNext ?? false);
    } catch {
      setHintMessage("Ошибка соединения с сервером");
    } finally {
      setIsHintLoading(false);
    }
  };

  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Информация</h2>

        <div className="space-y-4">
          <InfoRow label="Номер задания" value={String(task.number)} />
          <InfoRow label="Тема" value={task.topic} />

          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-sm text-gray-500">Сложность</span>
            <span className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
              {task.difficultyLabel}
            </span>
          </div>

          <InfoRow label="Среднее время решения" value={task.averageTime} />
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Ваши попытки</h2>

        {attempts.length === 0 && (
          <p className="text-sm text-gray-500">
            Вы еще не отправляли ответ на эту задачу.
          </p>
        )}

        {attempts.length > 0 && (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >
                <span className="text-sm font-medium text-gray-600">
                  {attempt.title}
                </span>

                <div className="flex items-center gap-2">
                  {attempt.type === "success" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}

                  {attempt.type === "wrong" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}

                  {attempt.type === "pending" && (
                    <Clock3 className="h-5 w-5 text-gray-400" />
                  )}

                  {attempt.type === "partial" && (
                    <Circle className="h-5 w-5 text-yellow-500" />
                  )}

                  <span className="text-sm text-gray-600">
                    {attempt.status}
                  </span>
                </div>

                <span className="text-sm text-gray-500">{attempt.time}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Подсказки</h2>

        <p className="text-sm leading-6 text-gray-500">
          Если задача вызывает трудности, используйте подсказку или откройте
          подробный разбор.
        </p>

        {hints.length > 0 && (
          <div className="mt-5 space-y-3">
            {hints.map((hint, index) => (
              <div
                key={`${hint}-${index}`}
                className="rounded-xl border border-blue-100 bg-blue-50/60 p-4"
              >
                <p className="mb-1 text-sm font-semibold text-blue-700">
                  Подсказка {index + 1}
                </p>
                <p className="text-sm leading-6 text-gray-700">{hint}</p>
              </div>
            ))}
          </div>
        )}

        {hintMessage && !hasNextHint && (
          <p className="mt-4 text-sm text-gray-500">{hintMessage}</p>
        )}

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleGetHint}
            disabled={isHintLoading || !hasNextHint}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-500 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isHintLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Lightbulb className="h-5 w-5" />
            )}
            {hasNextHint ? "Получить подсказку" : "Подсказки закончились"}
          </button>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-blue-600 transition hover:bg-gray-50"
          >
            <BookOpen className="h-5 w-5" />
            Разбор решения
          </button>
        </div>
      </section>
    </aside>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}