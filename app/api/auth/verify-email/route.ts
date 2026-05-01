import { NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonRequest } from "@/lib/api/parse-json-request";
import { prisma } from "@/lib/prisma";
import {
  setSessionCookie,
  signSessionToken,
} from "@/lib/auth/session";
import {
  VERIFICATION_CODE_MAX_ATTEMPTS,
  normalizeVerificationCode,
  verifyCodeHash,
} from "@/lib/auth/verification-code";
import { applyInviteCode } from "@/lib/auth/invite-code";

const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  code: z
    .string()
    .transform(normalizeVerificationCode)
    .pipe(z.string().length(6, "Введите 6-значный код")),
});

export async function POST(req: Request) {
  try {
    const body = await parseJsonRequest(req);

    if (!body.success) {
      return body.response;
    }

    const parsed = verifyEmailSchema.safeParse(body.data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Некорректные данные",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, code } = parsed.data;

    const verification = await prisma.emailVerificationCode.findUnique({
      where: {
        email,
      },
    });

    if (!verification || verification.consumedAt) {
      return NextResponse.json(
        { message: "Код подтверждения не найден" },
        { status: 404 },
      );
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Срок действия кода истёк" },
        { status: 400 },
      );
    }

    if (verification.attempts >= VERIFICATION_CODE_MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Слишком много попыток. Запросите новый код" },
        { status: 429 },
      );
    }

    const isCodeValid = await verifyCodeHash(code, verification.codeHash);

    if (!isCodeValid) {
      await prisma.emailVerificationCode.update({
        where: {
          email,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(
        { message: "Неверный код подтверждения" },
        { status: 400 },
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
        },
      });

      if (existingUser) {
        return {
          type: "USER_EXISTS" as const,
        };
      }

      const createdUser = await tx.user.create({
        data: {
          name: verification.name,
          email: verification.email,
          passwordHash: verification.passwordHash,
          role: verification.role,
          studentProfile:
            verification.role === "STUDENT"
              ? {
                  create: {},
                }
              : undefined,
          teacherProfile:
            verification.role === "TEACHER"
              ? {
                  create: {},
                }
              : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      await tx.emailVerificationCode.delete({
        where: {
          email,
        },
      });

      return {
        type: "SUCCESS" as const,
        user: createdUser,
      };
    });

    if (user.type === "USER_EXISTS") {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    // Apply invite code if present (links student to class or teacher)
    if (verification.inviteCode && user.user.role === "STUDENT") {
      try {
        await applyInviteCode(user.user.id, verification.inviteCode);
      } catch (err) {
        console.error("APPLY_INVITE_CODE_ERROR:", err);
        // Don't fail registration — student is still registered, just without auto-link
      }
    }

    const token = await signSessionToken({
      userId: user.user.id,
      email: user.user.email,
      name: user.user.name,
      role: user.user.role,
    });

    const response = NextResponse.json(
      {
        message: "Email подтверждён",
        user: user.user,
      },
      { status: 201 },
    );

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR:", error);

    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
