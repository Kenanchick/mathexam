"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle2, Users } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { createClassroom } from "../_actions/createClassroom";

const schema = z.object({
  title: z
    .string()
    .min(1, "Введите название класса")
    .max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional(),
});

type FormValues = z.infer<typeof schema>;

export type PersonalStudentOption = {
  id: string;
  name: string | null;
  email: string;
};

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  personalStudents: PersonalStudentOption[];
}

export const CreateClassModal = ({
  open,
  onClose,
  personalStudents,
}: CreateClassModalProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const result = await createClassroom({
      title: values.title,
      description: values.description,
      studentIds: selectedIds,
    });

    if (result.success) {
      reset();
      setSelectedIds([]);
      onClose();
    } else {
      setServerError(result.error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedIds([]);
    setServerError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Новый класс</h2>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Название
                </label>
                <input
                  {...register("title")}
                  placeholder="Например: 11А ЕГЭ"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-400"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Описание <span className="font-normal text-gray-400">(необязательно)</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Кратко о классе или курсе"
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-400"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Personal students */}
              {personalStudents.length > 0 && (
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4 text-gray-400" />
                    Добавить личных учеников
                    <span className="font-normal text-gray-400">(необязательно)</span>
                  </label>
                  <p className="mb-2 text-xs text-gray-400">
                    Выбранные ученики переедут из «Личных» в этот класс.
                  </p>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200">
                    {personalStudents.map((s, idx) => {
                      const checked = selectedIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors ${
                            checked ? "bg-gray-50" : "hover:bg-gray-50"
                          } ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStudent(s.id)}
                            className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                          />
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                            {(s.name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {s.name ?? "Ученик"}
                            </p>
                            <p className="truncate text-xs text-gray-400">{s.email}</p>
                          </div>
                          <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                        </label>
                      );
                    })}
                  </div>
                  {selectedIds.length > 0 && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Будет добавлено: <span className="font-semibold text-gray-700">{selectedIds.length}</span>
                    </p>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400">
                Код приглашения будет сгенерирован автоматически.
              </p>

              {serverError && (
                <p className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Создание..." : "Создать класс"}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
