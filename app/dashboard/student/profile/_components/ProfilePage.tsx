"use client";

import { useState, useTransition } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateProfile, updatePassword } from "../_actions/updateProfile";
import type { ProfileData } from "../_lib/getProfileData";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Ученик",
  TEACHER: "Учитель",
  ADMIN: "Администратор",
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  }
  return email[0].toUpperCase();
}

interface ProfilePageProps {
  data: ProfileData;
}

export const ProfilePage = ({ data }: ProfilePageProps) => {
  const initials = getInitials(data.name, data.email);

  // Profile form state
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profilePending, startProfileTransition] = useTransition();

  // Password form state
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordPending, startPasswordTransition] = useTransition();

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    const fd = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const res = await updateProfile(fd);
      setProfileMsg(
        res.success
          ? { type: "success", text: "Данные успешно сохранены" }
          : { type: "error", text: res.error ?? "Что-то пошло не так" },
      );
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    const fd = new FormData(e.currentTarget);
    startPasswordTransition(async () => {
      const res = await updatePassword(fd);
      if (res.success) {
        setPasswordMsg({ type: "success", text: "Пароль успешно изменён" });
        (e.target as HTMLFormElement).reset();
      } else {
        setPasswordMsg({ type: "error", text: res.error ?? "Что-то пошло не так" });
      }
    });
  };

  return (
    <div className="w-full max-w-3xl space-y-5">
      <div className="mb-4">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">Профиль</h1>
        <p className="mt-1 text-[16px] text-gray-500">Личные данные и настройки аккаунта</p>
      </div>

      {/* Profile card */}
      <div className="rounded border border-gray-200 bg-white px-6 py-5">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[22px] font-semibold text-gray-700 overflow-hidden">
            {data.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatarUrl} alt={data.name ?? ""} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[20px] font-semibold text-gray-900 truncate">
              {data.name ?? "—"}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-[14px] text-gray-500">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                {data.email}
              </span>
              <span className="flex items-center gap-1.5 text-[14px] text-gray-500">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {ROLE_LABEL[data.role] ?? data.role}
              </span>
              {data.classroom && (
                <span className="flex items-center gap-1.5 text-[14px] text-gray-500">
                  <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                  {data.classroom.title}
                </span>
              )}
              {data.studentProfile?.grade && (
                <span className="flex items-center gap-1.5 text-[14px] text-gray-500">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  {data.studentProfile.grade}
                </span>
              )}
            </div>
          </div>

          <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-[13px] font-medium text-gray-600">
            Активен
          </span>
        </div>
      </div>

      {/* Personal data */}
      <div className="rounded border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3.5">
          <h2 className="text-[16px] font-semibold text-gray-900">Личные данные</h2>
        </div>
        <form onSubmit={handleProfileSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Имя
              </label>
              <input
                name="name"
                type="text"
                defaultValue={data.name ?? ""}
                placeholder="Введите имя"
                className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={data.email}
                readOnly
                className="h-10 w-full rounded border border-gray-200 bg-gray-50 px-3 text-[14px] text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  Школа / учебное заведение
                </span>
              </label>
              <input
                name="school"
                type="text"
                defaultValue={data.studentProfile?.school ?? ""}
                placeholder="Лицей №12"
                className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                  Класс
                </span>
              </label>
              <input
                name="grade"
                type="text"
                defaultValue={data.studentProfile?.grade ?? ""}
                placeholder="11А"
                className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  Город
                </span>
              </label>
              <input
                name="city"
                type="text"
                defaultValue={data.studentProfile?.city ?? ""}
                placeholder="Москва"
                className="h-10 w-full rounded border border-gray-200 bg-white px-3 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            {profileMsg && (
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[13px]",
                  profileMsg.type === "success" ? "text-emerald-600" : "text-red-500",
                )}
              >
                {profileMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {profileMsg.text}
              </span>
            )}
            <button
              type="submit"
              disabled={profilePending}
              className="ml-auto h-9 rounded border border-gray-900 bg-gray-900 px-5 text-[14px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {profilePending ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="rounded border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3.5">
          <h2 className="text-[16px] font-semibold text-gray-900">Безопасность</h2>
          <p className="mt-0.5 text-[13px] text-gray-500">Изменение пароля аккаунта</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Текущий пароль
              </label>
              <div className="relative">
                <input
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3 pr-10 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Новый пароль
              </label>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3 pr-10 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                Повторите пароль
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 w-full rounded border border-gray-200 bg-white px-3 pr-10 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none transition focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            {passwordMsg && (
              <span
                className={cn(
                  "flex items-center gap-1.5 text-[13px]",
                  passwordMsg.type === "success" ? "text-emerald-600" : "text-red-500",
                )}
              >
                {passwordMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {passwordMsg.text}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Lock className="h-4 w-4 text-gray-400" />
              <button
                type="submit"
                disabled={passwordPending}
                className="h-9 rounded border border-gray-300 px-5 text-[14px] font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-60"
              >
                {passwordPending ? "Сохранение..." : "Изменить пароль"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded border border-red-200 bg-white">
        <div className="border-b border-red-200 bg-red-50 px-6 py-3.5">
          <h2 className="text-[16px] font-semibold text-red-700">Опасная зона</h2>
        </div>
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-[14px] font-medium text-gray-900">Удалить аккаунт</p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Все данные, прогресс и сохранённые настройки будут удалены безвозвратно.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              window.confirm("Вы уверены? Это действие необратимо.") &&
              alert("Функция удаления аккаунта пока недоступна.")
            }
            className="shrink-0 h-9 rounded border border-red-300 px-4 text-[14px] font-medium text-red-600 transition hover:bg-red-50"
          >
            Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
};
