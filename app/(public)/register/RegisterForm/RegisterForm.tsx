"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X,
  Ticket,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { TRole } from "../page";
import { useRouter } from "next/navigation";
import { readApiJson } from "@/lib/api/read-api-json";

const registerSchema = z
  .object({
    name: z.string().min(1, "Введите имя"),
    email: z.string().email("Введите корректный email"),
    password: z.string().min(8, "Пароль должен быть минимум 8 символов"),
    confirmPassword: z.string().min(8, "Повторите пароль"),
    role: z.enum(["STUDENT", "TEACHER"]),
    inviteCode: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type IRegisterForm = z.infer<typeof registerSchema>;

type RegisterFormProps = {
  selectedRole: TRole;
};

type RegisterResponse = {
  message?: string;
  email?: string;
  devFallback?: boolean;
};

type VerifyEmailResponse = {
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: "STUDENT" | "TEACHER";
  };
};

export const RegisterForm = ({ selectedRole }: RegisterFormProps) => {
  const [serverError, setServerError] = useState<string>("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: selectedRole,
      inviteCode: "",
    },
  });

  useEffect(() => {
    setValue("role", selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: IRegisterForm) => {
    setServerError("");
    setVerificationError("");
    setVerificationMessage("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await readApiJson<RegisterResponse>(
      res,
      "Сервер вернул некорректный ответ",
    );

    if (!res.ok) {
      setServerError(
        result.message || "Не удалось отправить код. Попробуйте ещё раз.",
      );
      return;
    }

    setPendingEmail(result.email || data.email);
    setVerificationCode("");
    setVerificationMessage(
      result.devFallback
        ? "Dev mode: код выведен в терминал"
        : "Код отправлен на email",
    );
    setIsCodeModalOpen(true);
  };

  const handleCodeChange = (value: string) => {
    setVerificationCode(value.replace(/\D/g, "").slice(0, 6));
    setVerificationError("");
  };

  const handleVerifyEmail = async () => {
    setVerificationError("");
    setVerificationMessage("");

    if (verificationCode.length !== 6) {
      setVerificationError("Введите 6-значный код");
      return;
    }

    try {
      setIsVerifying(true);

      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
          code: verificationCode,
        }),
      });

      const result = await readApiJson<VerifyEmailResponse>(
        res,
        "Сервер вернул некорректный ответ",
      );

      if (!res.ok) {
        setVerificationError(result.message || "Не удалось подтвердить email");
        return;
      }

      if (!result.user) {
        setVerificationError("Сервер не вернул данные пользователя");
        return;
      }

      if (result.user.role === "TEACHER") {
        router.replace("/dashboard/teacher");
      } else {
        router.replace("/dashboard/student");
      }

      router.refresh();
    } catch {
      setVerificationError("Ошибка соединения с сервером");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationError("");
    setVerificationMessage("");

    try {
      setIsResending(true);

      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: pendingEmail,
        }),
      });

      const result = await readApiJson<RegisterResponse>(
        res,
        "Сервер вернул некорректный ответ",
      );

      if (!res.ok) {
        setVerificationError(result.message || "Не удалось отправить код");
        return;
      }

      setVerificationCode("");
      setVerificationMessage(
        result.devFallback
          ? "Dev mode: код выведен в терминал"
          : "Код отправлен на email",
      );
    } catch {
      setVerificationError("Ошибка соединения с сервером");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Ошибка регистрации</p>
            <p className="mt-0.5 text-red-600">{serverError}</p>
          </div>
        </div>
      )}
      
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Имя
        </label>

        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Введите ваше имя"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
            {...register("name")}
          />
        </div>

        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Email
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500"
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {selectedRole === "STUDENT" && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Код приглашения <span className="text-gray-400">(необязательно)</span>
          </label>

          <div className="relative">
            <Ticket className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Например, ABCD1234"
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-mono uppercase tracking-wider outline-none transition focus:border-blue-500"
              {...register("inviteCode", {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
            />
          </div>

          <p className="mt-1 text-xs text-gray-400">
            Если учитель дал вам код класса или личный код — введите его, и вы автоматически попадёте к нему
          </p>

          {errors.inviteCode && (
            <p className="mt-1 text-sm text-red-600">{errors.inviteCode.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Пароль
        </label>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Минимум 8 символов"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-blue-500"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Повторите пароль
        </label>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Введите пароль ещё раз"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-blue-500"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label={
              showConfirmPassword ? "Скрыть пароль" : "Показать пароль"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        {isSubmitting ? "Отправляем код..." : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Войти
        </Link>
      </p>
      </form>
      {isCodeModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
        <div className="w-full max-w-[440px] rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Введите код из письма
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Мы отправили 6-значный код на {pendingEmail}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCodeModalOpen(false)}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {verificationError && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          {verificationMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{verificationMessage}</p>
            </div>
          )}

          <label className="mb-2 block text-sm font-medium text-gray-800">
            Код подтверждения
          </label>
          <input
            value={verificationCode}
            onChange={(event) => handleCodeChange(event.target.value)}
            inputMode="numeric"
            placeholder="000000"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-center text-lg font-semibold tracking-[0.35em] outline-none transition placeholder:text-gray-300 focus:border-blue-500"
          />

          <button
            type="button"
            onClick={handleVerifyEmail}
            disabled={isVerifying}
            className="mt-5 h-12 w-full rounded-xl bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isVerifying ? "Проверяем..." : "Подтвердить"}
          </button>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="mt-3 h-11 w-full rounded-xl border border-gray-200 bg-white text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isResending ? "Отправляем..." : "Отправить код ещё раз"}
          </button>
        </div>
      </div>
      )}
    </>
  );
};
