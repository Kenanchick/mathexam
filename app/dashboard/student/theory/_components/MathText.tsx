"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
  text: string;
  className?: string;
}

export function MathText({ text, className }: Props) {
  const html = useMemo(() => {
    // Split by $$...$$ first (block), then $...$  (inline)
    const parts: string[] = [];
    let rest = text;

    const processInline = (s: string): string => {
      return s.replace(/\$([^$]+)\$/g, (_, formula) => {
        try {
          return katex.renderToString(formula, {
            throwOnError: false,
            displayMode: false,
          });
        } catch {
          return `$${formula}$`;
        }
      });
    };

    // Replace block formulas $$...$$
    const blockRegex = /\$\$([^$]+)\$\$/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = blockRegex.exec(rest)) !== null) {
      const before = rest.slice(lastIndex, match.index);
      if (before) parts.push(processInline(before));
      try {
        parts.push(
          katex.renderToString(match[1], {
            throwOnError: false,
            displayMode: true,
          }),
        );
      } catch {
        parts.push(`$$${match[1]}$$`);
      }
      lastIndex = match.index + match[0].length;
    }

    const tail = rest.slice(lastIndex);
    if (tail) parts.push(processInline(tail));

    return parts.join("");
  }, [text]);

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
