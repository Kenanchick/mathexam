"use client";

import { useState, useRef } from "react";
import {
  Upload,
  File,
  X,
  Loader2,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionTask } from "../_lib/getHomeworkSession";

interface Part2TaskCardProps {
  task: SessionTask;
  taskIndex: number;
  totalTasks: number;
  isReadOnly: boolean;
  saving: boolean;
  onSave: (
    homeworkTaskId: string,
    comment: string,
    fileUrls: string[],
  ) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
}

function parseFileUrls(fileUrl: string | null): string[] {
  if (!fileUrl) return [];
  try {
    const parsed = JSON.parse(fileUrl);
    if (Array.isArray(parsed)) return parsed as string[];
    return [fileUrl];
  } catch {
    return [fileUrl];
  }
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/homework/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url: string };
    return data.url;
  } catch {
    return null;
  }
}

function fileLabel(url: string, index: number, total: number): string {
  const name = url.split("/").pop() ?? "Файл";
  return total > 1 ? `Файл ${index + 1} · ${name}` : name;
}

export const Part2TaskCard = ({
  task,
  taskIndex,
  totalTasks,
  isReadOnly,
  saving,
  onSave,
  onPrev,
  onNext,
}: Part2TaskCardProps) => {
  const [comment, setComment] = useState(task.answer?.answer ?? "");
  const [existingUrls, setExistingUrls] = useState<string[]>(() =>
    parseFileUrls(task.answer?.fileUrl ?? null),
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = task.answer?.result ?? null;
  const isSubmitted =
    task.answer?.submittedAt !== null && task.answer?.submittedAt !== undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadError(null);
    setSelectedFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (saving || uploading) return;

    let uploadedUrls: string[] = [];

    if (selectedFiles.length > 0) {
      setUploading(true);
      const results = await Promise.all(selectedFiles.map(uploadFile));
      setUploading(false);

      if (results.some((url) => url === null)) {
        setUploadError("Не удалось загрузить один или несколько файлов. Попробуйте ещё раз.");
        return;
      }
      uploadedUrls = results as string[];
    }

    const allUrls = [...existingUrls, ...uploadedUrls];
    await onSave(task.homeworkTaskId, comment, allUrls);
    setSelectedFiles([]);
  };

  const isBusy = saving || uploading;
  const hasAnything =
    existingUrls.length > 0 || selectedFiles.length > 0 || comment.trim().length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Task header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
              Задание {task.examNumber}
            </span>
            <span className="rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
              Часть 2 · Развёрнутый ответ
            </span>
            <span className="text-xs text-gray-400">{task.points} б.</span>
          </div>
          <p className="text-sm font-medium text-gray-500">{task.topicTitle}</p>
        </div>

        {/* Navigation */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onPrev}
            disabled={taskIndex === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[48px] text-center text-xs text-gray-400">
            {taskIndex + 1} / {totalTasks}
          </span>
          <button
            onClick={onNext}
            disabled={taskIndex === totalTasks - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task image */}
      {task.imageUrl && (
        <div className="mb-5 overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={task.imageUrl}
            alt="Условие задачи"
            className="max-h-72 w-full object-contain"
          />
        </div>
      )}

      {/* Task condition */}
      <div className="mb-6 flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {task.condition}
        </p>
      </div>

      {/* Answer / result block */}
      {isReadOnly ? (
        <div className="space-y-3 rounded-2xl border border-gray-100 p-5">
          {/* Status */}
          {result === "CORRECT" || result === "PARTIAL" ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Проверено преподавателем
              </span>
              {task.answer?.score !== null && (
                <span className="ml-auto text-sm font-bold text-emerald-700">
                  {task.answer?.score} / {task.points} б.
                </span>
              )}
            </div>
          ) : result === "WRONG" ? (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5">
              <span className="text-sm font-semibold text-red-600">
                Оценка: 0 / {task.points} б.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">
                Ожидает проверки преподавателем
              </span>
            </div>
          )}

          {/* Uploaded files */}
          {existingUrls.map((url, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5"
            >
              <File className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-sm text-gray-600">
                {fileLabel(url, i, existingUrls.length)}
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Открыть
              </a>
            </div>
          ))}

          {/* Student comment */}
          {task.answer?.answer && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">Ваш комментарий</p>
              <p className="text-sm text-gray-700">{task.answer.answer}</p>
            </div>
          )}

          {/* Teacher comment */}
          {task.answer?.teacherComment && (
            <div className="rounded-xl bg-amber-50 px-4 py-2.5">
              <p className="text-xs text-amber-500">Комментарий преподавателя</p>
              <p className="mt-0.5 text-sm text-amber-800">
                {task.answer.teacherComment}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-gray-100 p-5">
          {isSubmitted && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">
                Сохранено. Ожидает проверки преподавателем.
              </span>
            </div>
          )}

          {/* File upload area */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              Прикрепите файлы с решением
            </p>

            {/* Existing uploaded files */}
            {existingUrls.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {existingUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5"
                  >
                    <File className="h-4 w-4 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-gray-600">
                        {fileLabel(url, i, existingUrls.length)}
                      </p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-medium text-blue-600 hover:underline"
                    >
                      Открыть
                    </a>
                    <button
                      onClick={() => removeExistingUrl(i)}
                      className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Newly selected files (not yet uploaded) */}
            {selectedFiles.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {selectedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5"
                  >
                    <File className="h-4 w-4 shrink-0 text-blue-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-blue-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-blue-500">
                        {(file.size / 1024 / 1024).toFixed(1)} МБ · не загружен
                      </p>
                    </div>
                    <button
                      onClick={() => removeSelectedFile(i)}
                      className="shrink-0 rounded-lg p-1 text-blue-400 hover:bg-blue-100 hover:text-blue-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add file button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm text-gray-400 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500"
            >
              <Upload className="h-4 w-4" />
              {existingUrls.length + selectedFiles.length > 0
                ? "Добавить ещё файл"
                : "Нажмите или перетащите файл (JPEG, PNG, PDF, до 10 МБ)"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadError && (
              <p className="mt-2 text-xs text-red-500">{uploadError}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Комментарий (необязательно)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Можете добавить пояснение к решению..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!hasAnything || isBusy}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
              !hasAnything || isBusy
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700",
            )}
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? "Загружаем файлы..." : "Сохраняем..."}
              </>
            ) : (
              "Сохранить ответ"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
