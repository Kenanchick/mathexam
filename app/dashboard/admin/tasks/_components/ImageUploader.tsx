"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadTaskImageClient } from "../_lib/uploadTaskImageClient";

type ImageUploaderProps = {
  taskId: string; //настоящий id задачи или временный (для new)
  kind: "condition" | "solution";
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
  hint?: string;
};

const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

export function ImageUploader({
  taskId,
  kind,
  value,
  onChange,
  label,
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadTaskImageClient(file, taskId, kind);
        if (!result.ok) throw new Error(result.error);
        uploaded.push(result.url);
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(url: string) {
    onChange(value.filter((u) => u !== url));
    void fetch("/api/admin/task-image", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => undefined);
  }

  function move(url: string, dir: -1 | 1) {
    const idx = value.indexOf(url);
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>

      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div
            key={url}
            className="group relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="128px"
              className="object-contain"
              unoptimized
            />
            <div className="absolute inset-0 hidden flex-col justify-between bg-black/40 p-1 text-white group-hover:flex">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => move(url, -1)}
                  className="rounded bg-white/20 px-1.5 text-xs hover:bg-white/40"
                  aria-label="Влево"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(url, 1)}
                  className="rounded bg-white/20 px-1.5 text-xs hover:bg-white/40"
                  aria-label="Вправо"
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="rounded bg-red-500 py-1 text-xs hover:bg-red-600"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-sm text-gray-500 hover:border-gray-400 hover:text-gray-900 disabled:opacity-60"
        >
          {uploading ? "Загрузка…" : "+ Добавить"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {value.map((url) => (
        <input
          key={url}
          type="hidden"
          name={kind === "condition" ? "imageUrls" : "solutionImageUrls"}
          value={url}
        />
      ))}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
