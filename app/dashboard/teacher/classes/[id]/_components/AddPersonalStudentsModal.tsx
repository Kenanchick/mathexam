"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserCircle2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPersonalStudentsToClass } from "../../_actions/createClassroom";

export type PersonalStudentOption = {
  id: string;
  name: string | null;
  email: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  classroomId: string;
  classroomTitle: string;
  personalStudents: PersonalStudentOption[];
}

export const AddPersonalStudentsModal = ({
  open,
  onClose,
  classroomId,
  classroomTitle,
  personalStudents,
}: Props) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return personalStudents;
    return personalStudents.filter(
      (s) =>
        (s.name ?? "").toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [personalStudents, search]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearch("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    const result = await addPersonalStudentsToClass({
      classroomId,
      studentIds: selectedIds,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess(`Добавлено ${result.addedCount}`);
    setTimeout(() => handleClose(), 1000);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between px-6 pt-6 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Добавить в класс</h2>
                <p className="mt-1 text-base text-gray-500">
                  Выбранные ученики переедут из «Личных» в <span className="font-medium text-gray-700">{classroomTitle}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {personalStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                  <UserCircle2 className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-base font-medium text-gray-500">
                    Нет личных учеников
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Сначала добавьте ученика на странице «Ученики»
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200">
                    {filtered.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-gray-400">
                        Никого не найдено
                      </p>
                    ) : (
                      filtered.map((s, idx) => {
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
                              onChange={() => toggle(s.id)}
                              className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                            />
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                              {(s.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-base font-medium text-gray-900">
                                {s.name ?? "Ученик"}
                              </p>
                              <p className="truncate text-xs text-gray-400">{s.email}</p>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-xl border border-gray-800 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-900">
                      ✓ {success}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="rounded-xl"
                >
                  Отмена
                </Button>
                {personalStudents.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={selectedIds.length === 0 || loading}
                    className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Добавление..." : `Добавить (${selectedIds.length})`}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
