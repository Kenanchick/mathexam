"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { saveTask, type SaveTaskState } from "../_actions/saveTask";
import { deleteTask } from "../_actions/deleteTask";
import type { TaskForEdit } from "../_lib/getTaskForEdit";
import type { TopicOption } from "../_lib/getTopicsAndSubtopics";
import {
  extractImageFilesFromClipboard,
  uploadTaskImageClient,
} from "../_lib/uploadTaskImageClient";
import { slugify } from "@/lib/slugify";
import { ImageUploader } from "./ImageUploader";
import { StringListInput } from "./StringListInput";

type TaskFormProps = {
  task: TaskForEdit | null;
  topics: TopicOption[];
  taskIdForUploads: string; //настоящий id или временный для папки uploads
};

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-900";

export function TaskForm({ task, topics, taskIdForUploads }: TaskFormProps) {
  const router = useRouter();

  const initial: SaveTaskState = {};
  const [state, formAction, isPending] = useActionState<SaveTaskState, FormData>(
    async (prev, formData) => saveTask(task?.id ?? null, prev, formData),
    initial,
  );

  const [examNumber, setExamNumber] = useState<number>(task?.examNumber ?? 1);
  const [topicMode, setTopicMode] = useState<"existing" | "new">(
    task?.topicId ? "existing" : "existing",
  );
  const [topicId, setTopicId] = useState<string>(task?.topicId ?? "");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicSlug, setNewTopicSlug] = useState("");
  const [topicSlugTouched, setTopicSlugTouched] = useState(false);
  const [newTopicDescription, setNewTopicDescription] = useState("");

  const [subtopicMode, setSubtopicMode] = useState<"none" | "existing" | "new">(
    task?.subtopicId ? "existing" : "none",
  );
  const [subtopicId, setSubtopicId] = useState<string>(task?.subtopicId ?? "");
  const [newSubtopicTitle, setNewSubtopicTitle] = useState("");
  const [newSubtopicSlug, setNewSubtopicSlug] = useState("");
  const [subtopicSlugTouched, setSubtopicSlugTouched] = useState(false);
  const [newSubtopicDescription, setNewSubtopicDescription] = useState("");

  const [title, setTitle] = useState(task?.title ?? "");
  const [condition, setCondition] = useState(task?.condition ?? "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    task?.difficulty ?? "MEDIUM",
  );
  const [answerType, setAnswerType] = useState<"SHORT" | "NUMERIC" | "TEXT">(
    task?.answerType ?? "NUMERIC",
  );
  const [correctAnswer, setCorrectAnswer] = useState(task?.correctAnswer ?? "");
  const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>(
    task?.acceptedAnswers ?? [],
  );
  const [hints, setHints] = useState<string[]>(task?.hints ?? []);
  const [solution, setSolution] = useState(task?.solution ?? "");
  const [source, setSource] = useState(task?.source ?? "");
  const [solveTimeSec, setSolveTimeSec] = useState<string>(
    task?.solveTimeSec?.toString() ?? "",
  );
  const [imageUrls, setImageUrls] = useState<string[]>(task?.imageUrls ?? []);
  const [solutionImageUrls, setSolutionImageUrls] = useState<string[]>(
    task?.solutionImageUrls ?? [],
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    task?.status ?? "DRAFT",
  );

  const subtopicsOfSelectedTopic = useMemo(() => {
    return topics.find((t) => t.id === topicId)?.subtopics ?? [];
  }, [topics, topicId]);

  const [pasteState, setPasteState] = useState<{
    uploading: boolean;
    error: string | null;
  }>({ uploading: false, error: null });

  async function handlePaste(
    event: React.ClipboardEvent<HTMLTextAreaElement>,
    kind: "condition" | "solution",
  ) {
    const files = extractImageFilesFromClipboard(event);
    if (files.length === 0) return;
    event.preventDefault();
    setPasteState({ uploading: true, error: null });
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const result = await uploadTaskImageClient(file, taskIdForUploads, kind);
        if (!result.ok) throw new Error(result.error);
        uploaded.push(result.url);
      }
      if (kind === "condition") {
        setImageUrls((prev) => [...prev, ...uploaded]);
      } else {
        setSolutionImageUrls((prev) => [...prev, ...uploaded]);
      }
      setPasteState({ uploading: false, error: null });
    } catch (err) {
      setPasteState({
        uploading: false,
        error: err instanceof Error ? err.message : "Ошибка вставки",
      });
    }
  }

  function fieldError(key: string) {
    return state.fieldErrors?.[key];
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm("Удалить задачу? Это действие необратимо.")) return;
    await deleteTask(task.id);
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="topicMode" value={topicMode} />
      <input type="hidden" name="subtopicMode" value={subtopicMode} />

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-950">
          Тема и номер задания
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Номер задания</label>
            <select
              name="examNumber"
              value={examNumber}
              onChange={(e) => setExamNumber(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 19 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Задание {n}
                </option>
              ))}
            </select>
            {fieldError("examNumber") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("examNumber")}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Тема</label>
            <div className="mb-2 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTopicMode("existing")}
                className={`rounded-full px-3 py-1 ${topicMode === "existing" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
              >
                Существующая
              </button>
              <button
                type="button"
                onClick={() => setTopicMode("new")}
                className={`rounded-full px-3 py-1 ${topicMode === "new" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
              >
                Создать новую
              </button>
            </div>

            {topicMode === "existing" ? (
              <select
                name="topicId"
                value={topicId}
                onChange={(e) => {
                  setTopicId(e.target.value);
                  setSubtopicId("");
                }}
                className={inputClass}
              >
                <option value="">— выберите тему —</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  className={inputClass}
                  name="newTopicTitle"
                  placeholder="Название темы"
                  value={newTopicTitle}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewTopicTitle(v);
                    if (!topicSlugTouched) {
                      const auto = slugify(v);
                      setNewTopicSlug(
                        auto ? `ege-${examNumber}-${auto}` : "",
                      );
                    }
                  }}
                />
                <input
                  className={inputClass}
                  name="newTopicSlug"
                  placeholder="slug-temy"
                  value={newTopicSlug}
                  onChange={(e) => {
                    setNewTopicSlug(e.target.value);
                    setTopicSlugTouched(true);
                  }}
                />
                <input
                  className={`${inputClass} md:col-span-2`}
                  name="newTopicDescription"
                  placeholder="Описание (необязательно)"
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                />
              </div>
            )}
            {fieldError("topicId") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("topicId")}
              </p>
            )}
            {fieldError("newTopicTitle") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("newTopicTitle")}
              </p>
            )}
            {fieldError("newTopicSlug") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("newTopicSlug")}
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Подтема</label>
            <div className="mb-2 flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSubtopicMode("none")}
                className={`rounded-full px-3 py-1 ${subtopicMode === "none" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
              >
                Без подтемы
              </button>
              <button
                type="button"
                onClick={() => setSubtopicMode("existing")}
                className={`rounded-full px-3 py-1 ${subtopicMode === "existing" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
              >
                Существующая
              </button>
              <button
                type="button"
                onClick={() => setSubtopicMode("new")}
                className={`rounded-full px-3 py-1 ${subtopicMode === "new" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
              >
                Создать новую
              </button>
            </div>

            {subtopicMode === "existing" && (
              <select
                name="subtopicId"
                value={subtopicId}
                onChange={(e) => setSubtopicId(e.target.value)}
                className={inputClass}
                disabled={topicMode !== "existing" || !topicId}
              >
                <option value="">— выберите подтему —</option>
                {subtopicsOfSelectedTopic.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}

            {subtopicMode === "new" && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  className={inputClass}
                  name="newSubtopicTitle"
                  placeholder="Название подтемы"
                  value={newSubtopicTitle}
                  onChange={(e) => {
                    const v = e.target.value;
                    setNewSubtopicTitle(v);
                    if (!subtopicSlugTouched) {
                      setNewSubtopicSlug(slugify(v));
                    }
                  }}
                />
                <input
                  className={inputClass}
                  name="newSubtopicSlug"
                  placeholder="slug-podtemy"
                  value={newSubtopicSlug}
                  onChange={(e) => {
                    setNewSubtopicSlug(e.target.value);
                    setSubtopicSlugTouched(true);
                  }}
                />
                <input
                  className={`${inputClass} md:col-span-2`}
                  name="newSubtopicDescription"
                  placeholder="Описание (необязательно)"
                  value={newSubtopicDescription}
                  onChange={(e) => setNewSubtopicDescription(e.target.value)}
                />
              </div>
            )}
            {fieldError("subtopicId") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("subtopicId")}
              </p>
            )}
            {fieldError("newSubtopicTitle") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("newSubtopicTitle")}
              </p>
            )}
            {fieldError("newSubtopicSlug") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("newSubtopicSlug")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-950">Условие</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>
              Заголовок задачи (необязательно)
            </label>
            <input
              className={inputClass}
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Биссектрисы углов треугольника"
            />
          </div>

          <div>
            <label className={labelClass}>Текст условия</label>
            <textarea
              className={`${inputClass} min-h-[140px]`}
              name="condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              onPaste={(e) => handlePaste(e, "condition")}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Подсказка: вставьте скриншот через Cmd/Ctrl+V — он автоматически
              добавится к картинкам условия.
            </p>
            {fieldError("condition") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("condition")}
              </p>
            )}
          </div>

          <ImageUploader
            taskId={taskIdForUploads}
            kind="condition"
            value={imageUrls}
            onChange={setImageUrls}
            label="Картинки к условию"
            hint="PNG / JPG / WebP / SVG, до 5 МБ"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-950">Ответ</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Сложность</label>
            <select
              className={inputClass}
              name="difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as typeof difficulty)
              }
            >
              <option value="EASY">Лёгкая</option>
              <option value="MEDIUM">Средняя</option>
              <option value="HARD">Сложная</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Тип ответа</label>
            <select
              className={inputClass}
              name="answerType"
              value={answerType}
              onChange={(e) =>
                setAnswerType(e.target.value as typeof answerType)
              }
            >
              <option value="NUMERIC">Числовой</option>
              <option value="SHORT">Короткий ответ</option>
              <option value="TEXT">Развёрнутый</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Правильный ответ</label>
            <input
              className={inputClass}
              name="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
            />
            {fieldError("correctAnswer") && (
              <p className="mt-1 text-xs text-red-600">
                {fieldError("correctAnswer")}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <StringListInput
              name="acceptedAnswers"
              label="Допустимые варианты ответа"
              hint="Например: 119, 119.0, 119°"
              values={acceptedAnswers}
              onChange={setAcceptedAnswers}
              placeholder="Введите вариант и нажмите Enter"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-950">Решение</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Текст решения</label>
            <textarea
              className={`${inputClass} min-h-[140px]`}
              name="solution"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              onPaste={(e) => handlePaste(e, "solution")}
            />
            <p className="mt-1 text-xs text-gray-500">
              Подсказка: Cmd/Ctrl+V со скриншотом → картинка попадёт в блок
              решения.
            </p>
          </div>

          <ImageUploader
            taskId={taskIdForUploads}
            kind="solution"
            value={solutionImageUrls}
            onChange={setSolutionImageUrls}
            label="Картинки к решению"
          />

          <StringListInput
            name="hints"
            label="Подсказки"
            values={hints}
            onChange={setHints}
            placeholder="Подсказка для ученика"
            multiline
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-950">Метаданные</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className={labelClass}>Источник</label>
            <input
              className={inputClass}
              name="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Например: Реальные задания (ЕГЭ, ФИПИ)"
            />
          </div>
          <div>
            <label className={labelClass}>
              Время решения, сек (необязательно)
            </label>
            <input
              className={inputClass}
              name="solveTimeSec"
              type="number"
              value={solveTimeSec}
              onChange={(e) => setSolveTimeSec(e.target.value)}
              min={10}
              max={7200}
            />
          </div>
          <div>
            <label className={labelClass}>Статус</label>
            <select
              className={inputClass}
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликовано</option>
              <option value="ARCHIVED">В архиве</option>
            </select>
          </div>
        </div>
      </div>

      {pasteState.uploading && (
        <div className="rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Загрузка вставленного изображения…
        </div>
      )}
      {pasteState.error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {pasteState.error}
        </div>
      )}

      {state.error && (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isPending ? "Сохранение…" : task ? "Сохранить" : "Создать задачу"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/dashboard/admin/tasks")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          Отмена
        </button>

        {task && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto rounded-lg border border-red-300 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Удалить задачу
          </button>
        )}
      </div>
    </form>
  );
}
