import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorResponse,
  isAuthError,
  requireRole,
} from "@/lib/auth/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    await requireRole("STUDENT");

    const url = new URL(req.url);
    const hintIndex = Number(url.searchParams.get("index") ?? 0);

    if (!Number.isInteger(hintIndex) || hintIndex < 0) {
      return NextResponse.json(
        { message: "Некорректный номер подсказки" },
        { status: 400 },
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        hints: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Задача не найдена" },
        { status: 404 },
      );
    }

    if (task.hints.length === 0) {
      return NextResponse.json(
        {
          message: "Для этой задачи пока нет подсказок",
          hint: null,
          hintNumber: 0,
          totalHints: 0,
          hasNext: false,
        },
        { status: 200 },
      );
    }

    if (hintIndex >= task.hints.length) {
      return NextResponse.json(
        {
          message: "Все подсказки уже показаны",
          hint: null,
          hintNumber: task.hints.length,
          totalHints: task.hints.length,
          hasNext: false,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Подсказка загружена",
        hint: task.hints[hintIndex],
        hintNumber: hintIndex + 1,
        totalHints: task.hints.length,
        hasNext: hintIndex + 1 < task.hints.length,
      },
      { status: 200 },
    );
  } catch (error) {
    if (isAuthError(error)) {
      return authErrorResponse(error);
    }

    console.error("GET_TASK_HINT_ERROR:", error);

    return NextResponse.json(
      { message: "Ошибка сервера при загрузке подсказки" },
      { status: 500 },
    );
  }
}
