"use client";

import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/storage/types";

export type UploadKind = "condition" | "solution";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadTaskImageClient(
  file: File,
  taskId: string,
  kind: UploadKind,
): Promise<UploadResult> {
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return { ok: false, error: "Допустимы только PNG, JPEG, WebP или SVG" };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "Файл больше 5 МБ" };
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("taskId", taskId);
  fd.append("kind", kind);

  const res = await fetch("/api/admin/task-image", {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return { ok: false, error: body.message ?? "Не удалось загрузить файл" };
  }
  const body = (await res.json()) as { url: string };
  return { ok: true, url: body.url };
}

export function extractImageFilesFromClipboard(
  event: ClipboardEvent | React.ClipboardEvent,
): File[] {
  const items = Array.from(event.clipboardData?.items ?? []);
  const files: File[] = [];
  for (const item of items) {
    if (item.kind !== "file") continue;
    if (!item.type.startsWith("image/")) continue;
    const f = item.getAsFile();
    if (f) files.push(f);
  }
  return files;
}
