import { NextResponse } from "next/server";
import { z } from "zod";

import { parseJsonRequest } from "@/lib/api/parse-json-request";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationCode,
  getVerificationCodeExpiresAt,
  hashVerificationCode,
} from "@/lib/auth/verification-code";
import { sendVerificationCode } from "@/lib/email/send-verification-code";

const resendCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
});

export async function POST(req: Request) {
  try {
    const body = await parseJsonRequest(req);

    if (!body.success) {
      return body.response;
    }

    const parsed = resendCodeSchema.safeParse(body.data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Некорректные данные",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    const verification = await prisma.emailVerificationCode.findUnique({
      where: {
        email,
      },
    });

    if (!verification || verification.consumedAt) {
      return NextResponse.json(
        { message: "Заявка на регистрацию не найдена" },
        { status: 404 },
      );
    }

    const code = generateVerificationCode();
    const codeHash = await hashVerificationCode(code);

    await prisma.emailVerificationCode.update({
      where: {
        email,
      },
      data: {
        codeHash,
        attempts: 0,
        expiresAt: getVerificationCodeExpiresAt(),
        consumedAt: null,
      },
    });

    const emailResult = await sendVerificationCode({
      to: email,
      code,
    });

    return NextResponse.json(
      {
        message: emailResult.devFallback
          ? "Dev mode: код выведен в терминал"
          : "Код отправлен на email",
        devFallback: emailResult.devFallback,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("RESEND_CODE_ERROR:", error);

    return NextResponse.json(
      { message: "Не удалось отправить код. Попробуйте ещё раз." },
      { status: 503 },
    );
  }
}
