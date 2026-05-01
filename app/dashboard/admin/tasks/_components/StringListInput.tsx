"use client";

import { useState } from "react";

type StringListInputProps = {
  name: string;
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
};

export function StringListInput({
  name,
  label,
  values,
  onChange,
  placeholder,
  multiline,
  hint,
}: StringListInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>

      <ul className="mb-2 space-y-2">
        {values.map((v, i) => (
          <li
            key={`${v}-${i}`}
            className="flex items-start gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2"
          >
            <span className="flex-1 whitespace-pre-wrap text-sm text-gray-800">
              {v}
            </span>
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="text-xs text-red-600 hover:underline"
            >
              удалить
            </button>
            <input type="hidden" name={name} value={v} />
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            rows={2}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
          />
        )}
        <button
          type="button"
          onClick={add}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}
