import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  generateVerificationCode,
  getVerificationCodeExpiresAt,
  hashVerificationCode,
} from "@/lib/auth/verification-code";
import { parseJsonRequest } from "@/lib/api/parse-json-request";
import { sendVerificationCode } from "@/lib/email/send-verification-code";

const registerServerSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(80),
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен быть минимум 8 символов").max(100),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});

export async function POST(req: Request) {
  try {
    const body = await parseJsonRequest(req);

    if (!body.success) {
      return body.response;
    }

    const parsed = registerServerSchema.safeParse(body.data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Некорректные данные",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, password, role } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateVerificationCode();
    const codeHash = await hashVerificationCode(code);

    await prisma.emailVerificationCode.upsert({
      where: {
        email,
      },
      update: {
        name,
        passwordHash,
        role,
        codeHash,
        attempts: 0,
        expiresAt: getVerificationCodeExpiresAt(),
        consumedAt: null,
      },
      create: {
        email,
        name,
        passwordHash,
        role,
        codeHash,
        expiresAt: getVerificationCodeExpiresAt(),
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
        email,
        devFallback: emailResult.devFallback,
      },
      { status: 202 },
    );
  } catch (error) {
    console.error("REGISTER_ERROR", error);

    return NextResponse.json(
      { message: "Не удалось отправить код. Попробуйте ещё раз." },
      { status: 503 },
    );
  }
}
