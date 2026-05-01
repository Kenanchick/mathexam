"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Users, BookOpen, Copy, Check,
  UserX, Clock, AlertCircle, ChevronRight, GraduationCap,
  CalendarDays, BarChart3, UserPlus, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeStudent } from "../_actions/removeStudent";
import { deleteClassroom } from "../_actions/deleteClassroom";
import { AddPersonalStudentsModal, type PersonalStudentOption } from "./AddPersonalStudentsModal";
import type { ClassDetail } from "../_lib/getClassDetail";

type Tab = "students" | "homeworks";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDeadline(date: Date | null) {
  if (!date) return "Без дедлайна";
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  const formatted = new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  if (diff < 0) return `Просрочен · ${formatted}`;
  if (days === 0) return "Сегодня";
  if (days === 1) return "Завтра";
  return formatted;
}

interface Props {
  cls: ClassDetail;
  personalStudents: PersonalStudentOption[];
}

export const ClassDetailPage = ({ cls, personalStudents }: Props) => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClass = async () => {
    setDeleting(true);
    const result = await deleteClassroom(cls.id);
    if (result.success) {
      router.push("/dashboard/teacher/classes");
      router.refresh();
    } else {
      setDeleting(false);
      alert(result.error);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(cls.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemove = async (classStudentId: string) => {
    setRemovingId(classStudentId);
    try {
      await removeStudent(cls.id, classStudentId);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredStudents = useMemo(() =>
    cls.students.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ),
    [cls.students, search]
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/teacher/classes"
        className="inline-flex items-center gap-2 text-base text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Все классы
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{cls.title}</h1>
          {cls.description && (
            <p className="mt-2 text-lg text-gray-500">{cls.description}</p>
          )}
          <p className="mt-1 text-base text-gray-400">
            Создан {formatDate(cls.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            title="Удалить класс"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setAddModalOpen(true)}
            className="gap-2 rounded-xl"
          >
            <UserPlus className="h-4 w-4" />
            Добавить ученика
          </Button>
          <Button asChild className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800">
            <Link href={`/dashboard/teacher/homework/create`}>
              <BookOpen className="h-4 w-4" />
              Назначить ДЗ
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-4 gap-4"
      >
        {[
          { icon: Users, label: "Учеников", value: cls.studentCount },
          { icon: BookOpen, label: "Заданий", value: cls.homeworkCount },
          { icon: BarChart3, label: "Ср. прогресс", value: `${cls.avgProgress}%` },
          { icon: AlertCircle, label: "На проверке", value: cls.pendingReviews },
        ].map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Invite code */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex items-center justify-between rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-4"
      >
        <div>
          <p className="text-sm text-gray-400">Код приглашения</p>
          <p className="mt-0.5 font-mono text-2xl font-bold tracking-[0.3em] text-gray-900">
            {cls.inviteCode}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-base font-medium text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            {copied ? (
              <><Check className="h-4 w-4 text-gray-700" /> Скопировано</>
            ) : (
              <><Copy className="h-4 w-4" /> Скопировать</>
            )}
          </button>
          <p className="text-xs text-gray-400">
            Ученики вводят код при регистрации
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
        {([
          { id: "students", label: "Ученики", count: cls.studentCount },
          { id: "homeworks", label: "Задания", count: cls.homeworkCount },
        ] as const).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-base font-medium transition-all ${
              tab === id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              tab === id ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Students tab */}
      <AnimatePresence mode="wait">
        {tab === "students" && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или email..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
            />

            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <GraduationCap className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-500">
                  {search ? "Никого не найдено" : "Учеников пока нет"}
                </p>
                {!search && (
                  <p className="text-sm text-gray-400">
                    Поделитесь кодом приглашения — ученики вступят сами
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
                      index !== 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-bold text-gray-600">
                      {student.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-400">{student.email}</p>
                    </div>

                    {/* Progress */}
                    <div className="w-32 shrink-0">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Прогресс</span>
                        <span className="text-xs font-semibold text-gray-700">
                          {student.progressPercent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          className="h-full rounded-full bg-gray-700"
                          initial={{ width: 0 }}
                          animate={{ width: `${student.progressPercent}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + index * 0.03, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Submitted */}
                    <div className="shrink-0 text-center">
                      <p className="text-base font-semibold text-gray-900">
                        {student.submittedCount}/{student.totalHomeworks}
                      </p>
                      <p className="text-xs text-gray-400">сдано</p>
                    </div>

                    {/* Joined */}
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(student.joinedAt)}
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(student.id)}
                      disabled={removingId === student.id}
                      className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                      title="Отчислить ученика"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Homeworks tab */}
        {tab === "homeworks" && (
          <motion.div
            key="homeworks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {cls.homeworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                  <BookOpen className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-500">Заданий пока нет</p>
                <Button asChild className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800">
                  <Link href="/dashboard/teacher/homework/create">
                    Назначить задание
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {cls.homeworks.map((hw, index) => {
                  const progress = hw.recipientCount > 0
                    ? Math.round((hw.submittedCount / hw.recipientCount) * 100)
                    : 0;
                  const isOverdue = hw.deadline && new Date(hw.deadline) < new Date();

                  return (
                    <motion.div
                      key={hw.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${
                            hw.status === "PUBLISHED"
                              ? "border-gray-800 text-gray-800"
                              : "border-gray-200 text-gray-400"
                          }`}>
                            {hw.status === "PUBLISHED" ? "Активно" : "Завершено"}
                          </span>
                        </div>
                        <p className="mt-1.5 text-lg font-semibold text-gray-900">{hw.title}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-red-400" : "text-gray-400"}`} />
                            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                              {formatDeadline(hw.deadline)}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {hw.submittedCount}/{hw.recipientCount} сдали
                          </span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <motion.div
                              className="h-full rounded-full bg-gray-700"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                            />
                          </div>
                          <span className="shrink-0 text-sm font-medium text-gray-500">{progress}%</span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/teacher/homework/${hw.id}`}
                        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-base font-medium text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Открыть
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddPersonalStudentsModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        classroomId={cls.id}
        classroomTitle={cls.title}
        personalStudents={personalStudents}
      />

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Удалить класс?</h2>
              <p className="mt-2 text-base text-gray-500">
                Класс <span className="font-semibold text-gray-700">«{cls.title}»</span> будет удалён навсегда.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-500">
                <li>· Все ученики ({cls.studentCount}) выйдут из класса</li>
                <li>· Назначенные ДЗ останутся, но без привязки к классу</li>
                <li>· Это действие нельзя отменить</li>
              </ul>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="rounded-xl"
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteClass}
                  disabled={deleting}
                  className="gap-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Удаление..." : "Удалить класс"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
