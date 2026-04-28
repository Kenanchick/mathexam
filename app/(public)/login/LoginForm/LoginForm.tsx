"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { readApiJson } from "@/lib/api/read-api-json";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(8, "Введите пароль"),
});

type ILoginForm = z.infer<typeof loginSchema>;

type LoginResponse = {
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: "STUDENT" | "TEACHER";
  };
};

export const LoginForm = () => {
  const router = useRouter();

  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ILoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: ILoginForm) => {
    setServerError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await readApiJson<LoginResponse>(
      res,
      "Сервер вернул некорректный ответ",
    );

    if (!res.ok) {
      setServerError(result.message || "Не удалось войти в аккаунт");
      return;
    }

    if (!result.user) {
      setServerError("Сервер не вернул данные пользователя");
      return;
    }

    if (result.user.role === "TEACHER") {
      router.replace("/dashboard/teacher");
    } else {
      router.replace("/dashboard/student");
    }

    router.refresh();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Ошибка входа</p>
            <p className="mt-0.5 text-red-600">{serverError}</p>
          </div>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">Email</label>

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="email"
            placeholder="you@example.com"
            className="h-14 w-full rounded-lg border border-gray-200 pl-12 pr-4 text-base outline-none transition placeholder:text-gray-400 focus:border-blue-500"
            {...register("email")}
          />
        </div>

        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Пароль</label>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            className="h-14 w-full rounded-lg border border-gray-200 px-12 text-base outline-none transition placeholder:text-gray-400 focus:border-blue-500"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 accent-blue-600"
          />
          Запомнить меня
        </label>

        <button type="button" className="font-medium text-blue-600">
          Забыли пароль?
        </button>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full text-base"
      >
        {isSubmitting ? "Вход..." : "Войти"}
      </Button>

      <div className="flex items-center gap-4 py-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">или</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white text-base font-medium transition hover:bg-gray-50"
      >
        <Image src="/google.svg" alt="Google" width={20} height={20} />
        Войти через Google
      </button>

      <p className="pt-3 text-center text-base text-gray-600">
        Нет аккаунта?{" "}
        <Link className="text-blue-600" href="/register">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
};
