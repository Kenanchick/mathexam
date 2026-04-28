import { cn } from "@/lib/utils";
import type { HomeworkStatus } from "../_lib/getHomeworkData";

const config: Record<HomeworkStatus, { label: string; className: string }> = {
  new: { label: "Новое", className: "bg-blue-50 text-blue-600" },
  in_progress: { label: "В процессе", className: "bg-amber-50 text-amber-600" },
  submitted: { label: "Сдано", className: "bg-emerald-50 text-emerald-600" },
  overdue: { label: "Просрочено", className: "bg-red-50 text-red-500" },
};

export const HomeworkStatusBadge = ({ status }: { status: HomeworkStatus }) => {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-block rounded-xl px-3 py-1 text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
};
