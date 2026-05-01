"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { MathText } from "@/components/MathText";

type CheckAnswerResponse = {
  message?: string;
  attempt?: {
    id: string;
    result: "CORRECT" | "WRONG" | "PENDING" | "PARTIAL";
    isCorrect: boolean;
    answer: string | null;
    submittedAt: string;
  };
};

type SolutionResponse = {
  message?: string;
  solution?: string | null;
  hints?: string[];
  solutionImageUrls?: string[];
};

export const AnswerCard = ({ taskId }: { taskId: string }) => {
  const router = useRouter();

  const [answer, setAnswer] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [solution, setSolution] = useState<string | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [solutionImageUrls, setSolutionImageUrls] = useState<string[]>([]);
  const [solutionMessage, setSolutionMessage] = useState("");
  const [isSolutionLoading, setIsSolutionLoading] = useState(false);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);

  const handleCheckAnswer = async () => {
    setServerMessage("");
    setIsCorrect(null);

    if (!answer.trim()) {
      setServerMessage("Введите ответ");
      setIsCorrect(false);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch(`/api/student/tasks/${taskId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answer,
        }),
      });

      const contentType = res.headers.get("content-type");

      let result: CheckAnswerResponse = {
        message: "Не удалось проверить ответ",
      };

      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        result = {
          message: "Сервер вернул ошибку. Посмотри терминал Next.js.",
        };
      }

      if (!res.ok) {
        setServerMessage(result.message || "Не удалось проверить ответ");
        setIsCorrect(false);
        return;
      }

      setServerMessage(result.message || "Ответ проверен");
      setIsCorrect(result.attempt?.isCorrect ?? false);

      router.refresh();
    } catch {
      setServerMessage("Ошибка соединения с сервером");
      setIsCorrect(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowSolution = async () => {
    if (isSolutionVisible) {
      setIsSolutionVisible(false);
      return;
    }

    if (solution || solutionImageUrls.length > 0 || solutionMessage) {
      setIsSolutionVisible(true);
      return;
    }

    try {
      setIsSolutionLoading(true);

      const res = await fetch(`/api/student/tasks/${taskId}/solution`, {
        method: "GET",
      });

      const contentType = res.headers.get("content-type");

      let result: SolutionResponse = {
        message: "Не удалось загрузить решение",
      };

      if (contentType?.includes("application/json")) {
        result = await res.json();
      } else {
        result = {
          message: "Сервер вернул ошибку. Посмотри терминал Next.js.",
        };
      }

      if (!res.ok) {
        setSolutionMessage(result.message || "Не удалось загрузить решение");
        setIsSolutionVisible(true);
        return;
      }

      setSolution(result.solution ?? null);
      setHints(result.hints ?? []);
      setSolutionImageUrls(result.solutionImageUrls ?? []);
      setSolutionMessage(result.message || "");
      setIsSolutionVisible(true);
    } catch {
      setSolutionMessage("Ошибка соединения с сервером");
      setIsSolutionVisible(true);
    } finally {
      setIsSolutionLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <label className="mb-3 block text-base font-bold text-gray-900">
        Введите ответ
      </label>

      <input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Например, 5"
        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-base outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />

      {serverMessage && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}

          <div>
            <p className="font-semibold">
              {isCorrect ? "Верно" : "Проверьте ответ"}
            </p>
            <p className="mt-0.5">{serverMessage}</p>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={handleCheckAnswer}
          disabled={isSubmitting}
          className="h-12 rounded-xl bg-blue-600 px-10 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isSubmitting ? "Проверяем..." : "Проверить ответ"}
        </button>

        <button
          type="button"
          onClick={handleShowSolution}
          disabled={isSolutionLoading}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-10 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSolutionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSolutionVisible ? "Скрыть решение" : "Показать решение"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isSolutionVisible && (
          <motion.div
            key="solution"
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 20 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <h3 className="mb-3 text-base font-bold text-gray-900">
                Разбор решения
              </h3>

              {solution && (
                <MathText
                  text={solution}
                  className="block text-sm leading-7 text-gray-700"
                />
              )}

              {solutionImageUrls.length > 0 && (
                <div
                  className={`flex flex-col gap-3 ${solution ? "mt-4" : ""}`}
                >
                  {solutionImageUrls.map((src, index) => (
                    <div
                      key={src}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >
                      <Image
                        src={src}
                        alt={`Решение, рисунок ${index + 1}`}
                        width={960}
                        height={540}
                        className="max-h-[420px] w-full object-contain"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}

              {!solution && solutionImageUrls.length === 0 && (
                <p className="text-sm leading-7 text-gray-600">
                  {solutionMessage ||
                    "Для этой задачи пока нет разбора решения."}
                </p>
              )}

              {hints.length > 0 && (
                <div className="mt-5">
                  <h4 className="mb-2 text-sm font-bold text-gray-900">
                    Подсказки
                  </h4>

                  <ul className="space-y-2 text-sm text-gray-700">
                    {hints.map((hint, index) => (
                      <li key={hint} className="flex gap-2">
                        <span className="font-semibold text-gray-700">
                          {index + 1}.
                        </span>
                        <MathText text={hint} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
