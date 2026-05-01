"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Copy, Check, UserPlus, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStudentByEmail, ensurePersonalInviteCode } from "../_actions/addStudent";

interface Props {
  open: boolean;
  onClose: () => void;
  initialInviteCode: string | null;
}

type Tab = "email" | "code";

export const AddStudentModal = ({ open, onClose, initialInviteCode }: Props) => {
  const [tab, setTab] = useState<Tab>("email");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [inviteCode, setInviteCode] = useState<string | null>(initialInviteCode);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail(""); setNote(""); setError(null); setSuccess(null);
    }
  }, [open]);

  const handleAdd = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const result = await addStudentByEmail({ email, note: note || undefined });
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }
    setSuccess(`${result.student.name ?? result.student.email} добавлен`);
    setEmail("");
    setNote("");
    setTimeout(() => onClose(), 1200);
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    const code = await ensurePersonalInviteCode();
    setInviteCode(code);
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={onClose}
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
                <h2 className="text-2xl font-bold text-gray-900">Добавить ученика</h2>
                <p className="mt-1 text-base text-gray-500">
                  По email или поделиться кодом
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6">
              <div className="mb-5 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-full">
                {[
                  { id: "email" as const, label: "По email", icon: Mail },
                  { id: "code" as const, label: "По коду", icon: LinkIcon },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-base font-medium transition-all ${
                      tab === id
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {tab === "email" && (
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email ученика
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    Ученик уже должен быть зарегистрирован в системе
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Заметка <span className="text-gray-400">(необязательно)</span>
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Например: репетиторство по геометрии"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-800 outline-none placeholder:text-gray-400 focus:border-gray-400 transition-colors"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-xl border border-gray-800 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
                    ✓ {success}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="rounded-xl"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!email || loading}
                    className="gap-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Добавление..." : "Добавить"}
                  </Button>
                </div>
              </div>
            )}

            {tab === "code" && (
              <div className="px-6 pb-6 space-y-4">
                <p className="text-base text-gray-600">
                  Поделитесь кодом с учеником — он введёт его при регистрации и автоматически попадёт к вам.
                </p>

                {inviteCode ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-5">
                    <p className="text-sm text-gray-400">Ваш персональный код</p>
                    <div className="mt-1 flex items-center gap-3">
                      <p className="font-mono text-3xl font-bold tracking-[0.3em] text-gray-900">
                        {inviteCode}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="ml-auto flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                      >
                        {copied ? (
                          <><Check className="h-4 w-4" /> Скопировано</>
                        ) : (
                          <><Copy className="h-4 w-4" /> Скопировать</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={generating}
                    className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                  >
                    {generating ? "Создание..." : "Сгенерировать код"}
                  </Button>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="rounded-xl"
                  >
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
