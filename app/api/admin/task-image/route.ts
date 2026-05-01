import { NextResponse } from "next/server";

import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  taskImageStorage,
} from "@/lib/storage";
import {
  AuthError,
  authErrorResponse,
  requireRole,
} from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    throw error;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const rawTaskId = formData.get("taskId");
  const rawKind = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Файл не передан" }, { status: 400 });
  }

  const taskId = typeof rawTaskId === "string" ? rawTaskId : "";
  const kind = rawKind === "solution" ? "solution" : "condition";

  if (!/^[a-z0-9-]+$/i.test(taskId) || taskId.length > 80) {
    return NextResponse.json(
      { message: "Неверный идентификатор задачи" },
      { status: 400 },
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return NextResponse.json(
      {
        message:
          "Допустимы только PNG, JPEG, WebP или SVG",
      },
      { status: 415 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { message: "Файл больше 5 МБ" },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploaded = await taskImageStorage.uploadTaskImage({
    buffer,
    mimeType: file.type,
    originalName: file.name,
    taskId,
    kind,
  });

  return NextResponse.json({ url: uploaded.url, key: uploaded.key });
}

export async function DELETE(request: Request) {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    throw error;
  }

  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  if (!url || typeof url !== "string") {
    return NextResponse.json({ message: "url не передан" }, { status: 400 });
  }
  await taskImageStorage.deleteTaskImage(url).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
