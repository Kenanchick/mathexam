"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HomeworkProgressProps {
  completed: number;
  total: number;
  overdue?: boolean;
}

export const HomeworkProgress = ({
  completed,
  total,
  overdue,
}: HomeworkProgressProps) => {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(percent), 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent]);

  return (
    <div ref={ref} className="min-w-[100px]">
      <p
        className={cn(
          "mb-1.5 text-[15px] font-semibold",
          overdue ? "text-red-500" : "text-gray-900",
        )}
      >
        {completed}/{total}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-gray-200">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out",
            overdue
              ? "bg-red-400"
              : percent === 100
                ? "bg-emerald-500"
                : "bg-gray-600",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};
