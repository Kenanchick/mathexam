import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  authErrorResponse,
  isAuthError,
  requireRole,
} from "@/lib/auth/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    await requireRole("STUDENT");

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        solution: true,
        hints: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { message: "Задача не найдена" },
        { status: 404 },
      );
    }

    if (!task.solution) {
      return NextResponse.json(
        {
          message: "Для этой задачи пока нет разбора решения",
          solution: null,
          hints: task.hints,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        message: "Решение загружено",
        solution: task.solution,
        hints: task.hints,
      },
      { status: 200 },
    );
  } catch (error) {
    if (isAuthError(error)) {
      return authErrorResponse(error);
    }

    console.error("GET_TASK_SOLUTION_ERROR:", error);

    return NextResponse.json(
      { message: "Ошибка сервера при загрузке решения" },
      { status: 500 },
    );
  }
}
