"use client";

import katex from "katex";

type MathTextProps = {
  text: string;
  className?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
      output: "html",
      strict: "ignore",
    });
  } catch {
    return escapeHtml(
      (displayMode ? "$$" : "$") + formula + (displayMode ? "$$" : "$"),
    );
  }
}

function renderText(input: string): string {
  // Нормализация:
  //  • MathJax-разделители \(...\) и \[...\] приводим к $...$ / $$...$$
  //  • длинные тире (—, –) → обычный минус (KaTeX их не понимает)
  //  • неразрывный пробел → обычный
  const normalized = input
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/ /g, " ");

  let html = "";
  let i = 0;
  const n = normalized.length;

  while (i < n) {
    const ch = normalized[i];
    if (ch === "$") {
      const isDisplay = normalized[i + 1] === "$";
      const startIdx = isDisplay ? i + 2 : i + 1;
      let endIdx = -1;
      for (let j = startIdx; j < n; j++) {
        if (normalized[j] === "$") {
          if (isDisplay && normalized[j + 1] === "$") {
            endIdx = j;
            break;
          }
          if (!isDisplay) {
            endIdx = j;
            break;
          }
        }
      }
      if (endIdx === -1) {
        html += escapeHtml(ch);
        i += 1;
        continue;
      }
      const formula = normalized.slice(startIdx, endIdx);
      html += renderInline(formula, isDisplay);
      i = endIdx + (isDisplay ? 2 : 1);
    } else if (ch === "\n") {
      html += "<br />";
      i += 1;
    } else {
      html += escapeHtml(ch);
      i += 1;
    }
  }

  return html;
}

export function MathText({ text, className }: MathTextProps) {
  if (!text) return null;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderText(text) }}
    />
  );
}
