"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Users, TrendingUp, AlertCircle,
  CalendarDays, ChevronRight, School, SlidersHorizontal,
  UserPlus, UserX, UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TeacherStudent } from "../_lib/getTeacherStudents";
import { AddStudentModal } from "./AddStudentModal";
import { removeDirectStudent } from "../_actions/addStudent";

type SortKey = "name" | "progress" | "submitted" | "joined";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

interface Props {
  students: TeacherStudent[];
  classrooms: { id: string; title: string }[];
  initialInviteCode: string | null;
}

export const StudentsPage = ({ students, classrooms, initialInviteCode }: Props) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDesc, setSortDesc] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchClass =
        classFilter === "all" ||
        (classFilter === "direct" && s.source === "direct") ||
        s.classroomId === classFilter;
      return matchSearch && matchClass;
    });

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name, "ru");
      else if (sortBy === "progress") cmp = a.progressPercent - b.progressPercent;
      else if (sortBy === "submitted") cmp = a.submittedCount - b.submittedCount;
      else if (sortBy === "joined") cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      return sortDesc ? -cmp : cmp;
    });

    return list;
  }, [students, search, classFilter, sortBy, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDesc((d) => !d);
    else { setSortBy(key); setSortDesc(false); }
  };

  const handleRemoveDirect = async (id: string) => {
    setRemovingId(id);
    try {
      await removeDirectStudent(id);
    } finally {
      setRemovingId(null);
    }
  };

  const directCount = students.filter((s) => s.source === "direct").length;
  const avgProgress = students.length > 0
    ? Math.round(students.reduce((s, st) => s + st.progressPercent, 0) / students.length)
    : 0;
  const totalPending = students.reduce((s, st) => s + st.pendingCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Ученики</h1>
          <p className="mt-1.5 text-lg text-gray-500">
            {students.length > 0
              ? `${students.length} учеников · ${classrooms.length} классов${directCount > 0 ? ` · ${directCount} личных` : ""}`
              : "Добавьте учеников или поделитесь кодом"}
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
        >
          <UserPlus className="h-4 w-4" />
          Добавить ученика
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { icon: Users, label: "Всего учеников", value: students.length },
          { icon: TrendingUp, label: "Средний прогресс", value: `${avgProgress}%` },
          { icon: AlertCircle, label: "Ждут проверки", value: totalPending },
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors shadow-sm"
          />
        </div>

        <div className="relative">
          <School className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-8 text-base text-gray-700 outline-none focus:border-gray-400 transition-colors shadow-sm cursor-pointer"
          >
            <option value="all">Все ученики</option>
            {directCount > 0 && <option value="direct">Личные ученики</option>}
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={`${sortBy}-${sortDesc ? "desc" : "asc"}`}
            onChange={(e) => {
              const [key, dir] = e.target.value.split("-");
              setSortBy(key as SortKey);
              setSortDesc(dir === "desc");
            }}
            className="h-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-8 text-base text-gray-700 outline-none focus:border-gray-400 transition-colors shadow-sm cursor-pointer"
          >
            <option value="name-asc">Имя А–Я</option>
            <option value="name-desc">Имя Я–А</option>
            <option value="progress-desc">Прогресс ↓</option>
            <option value="progress-asc">Прогресс ↑</option>
            <option value="submitted-desc">Сдано больше</option>
            <option value="joined-desc">Новые первые</option>
            <option value="joined-asc">Старые первые</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Users className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-base font-medium text-gray-500">
            {search || classFilter !== "all" ? "Никого не найдено" : "Учеников пока нет"}
          </p>
          <p className="text-sm text-gray-400">
            {search || classFilter !== "all"
              ? "Попробуйте изменить фильтры"
              : "Добавьте ученика по email или поделитесь кодом приглашения"}
          </p>
          {!search && classFilter === "all" && (
            <Button
              onClick={() => setModalOpen(true)}
              className="mt-2 gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4" />
              Добавить ученика
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-100 px-6 py-3">
            {[
              { key: "name" as SortKey, label: "Ученик" },
              { key: null, label: "Класс / Тип" },
              { key: "progress" as SortKey, label: "Прогресс" },
              { key: "submitted" as SortKey, label: "Сдано" },
              { key: "joined" as SortKey, label: "Вступил" },
            ].map(({ key, label }) => (
              <button
                key={label}
                onClick={() => key && toggleSort(key)}
                className={`text-left text-sm font-medium transition-colors ${
                  key ? "cursor-pointer hover:text-gray-900" : "cursor-default"
                } ${key && sortBy === key ? "text-gray-900" : "text-gray-400"}`}
              >
                {label}
                {key && sortBy === key && (
                  <span className="ml-1">{sortDesc ? "↓" : "↑"}</span>
                )}
              </button>
            ))}
            <span />
          </div>

          {/* Rows */}
          {filtered.map((student, index) => (
            <motion.div
              key={`${student.source}-${student.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${
                index !== 0 ? "border-t border-gray-100" : ""
              }`}
            >
              {/* Student */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-base font-bold text-gray-600">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-gray-900">{student.name}</p>
                  <p className="truncate text-sm text-gray-400">{student.email}</p>
                </div>
              </div>

              {/* Class / Type */}
              {student.source === "class" ? (
                <Link
                  href={`/dashboard/teacher/classes/${student.classroomId}`}
                  className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  <School className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">{student.classroomTitle}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">Личный ученик</span>
                </span>
              )}

              {/* Progress */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{student.progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full bg-gray-700"
                    initial={{ width: 0 }}
                    animate={{ width: `${student.progressPercent}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.02, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Submitted */}
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {student.submittedCount}
                  <span className="text-sm font-normal text-gray-400">/{student.totalHomeworks}</span>
                </p>
                {student.pendingCount > 0 && (
                  <p className="text-xs text-gray-500">
                    {student.pendingCount} на проверке
                  </p>
                )}
              </div>

              {/* Joined */}
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {formatDate(student.joinedAt)}
              </div>

              {/* Action */}
              {student.source === "class" ? (
                <Link
                  href={`/dashboard/teacher/classes/${student.classroomId}`}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
                >
                  Класс
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  onClick={() => handleRemoveDirect(student.id)}
                  disabled={removingId === student.id}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  title="Удалить из своих учеников"
                >
                  <UserX className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      <AddStudentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialInviteCode={initialInviteCode}
      />
    </div>
  );
};
