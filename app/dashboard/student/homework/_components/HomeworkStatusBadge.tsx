import { cn } from "@/lib/utils";
import type { HomeworkStatus } from "../_lib/getHomeworkData";

const config: Record<HomeworkStatus, { label: string; className: string }> = {
  new: {
    label: "Новое",
    className: "border border-gray-300 bg-gray-50 text-gray-700",
  },
  in_progress: {
    label: "В процессе",
    className: "border border-gray-300 bg-gray-50 text-gray-600",
  },
  submitted: {
    label: "Сдано",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  overdue: {
    label: "Просрочено",
    className: "border border-red-200 bg-red-50 text-red-600",
  },
};

export const HomeworkStatusBadge = ({ status }: { status: HomeworkStatus }) => {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-block rounded px-2.5 py-1 text-[13px] font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
};
