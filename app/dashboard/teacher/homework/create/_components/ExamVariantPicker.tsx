"use client";

import { BookMarked } from "lucide-react";

export const ExamVariantPicker = () => {
  // TODO: implement when Variant model is added to the schema
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <BookMarked className="h-6 w-6 text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">
          Готовые варианты ЕГЭ
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Библиотека вариантов будет доступна в следующей версии
        </p>
      </div>
    </div>
  );
};
