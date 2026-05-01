import Link from "next/link";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import type {
  CatalogTaskProgressStatus,
  CatalogTaskView,
} from "../_lib/getTasksCatalog";

type TaskCardProps = {
  task: CatalogTaskView;
};

const statusLabels: Record<CatalogTaskProgressStatus, string> = {
  solved: "Решено",
  unsolved: "Не решено",
  error: "Не решено",
};

const statusStyles: Record<CatalogTaskProgressStatus, string> = {
  solved: "text-emerald-600",
  unsolved: "text-gray-400",
  error: "text-gray-400",
};

const statusIcons = {
  solved: CheckCircle2,
  unsolved: Circle,
  error: AlertCircle,
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const StatusIcon = statusIcons[task.status];

  return (
    <article className="grid min-h-[100px] grid-cols-[190px_1fr_130px_108px] items-stretch rounded border border-gray-200 bg-white transition hover:bg-gray-50/60">
      <div className="flex flex-col justify-center px-5 py-4">
        <p className="mb-1 text-[12px] font-medium uppercase tracking-wide text-gray-400">
          Задание {task.number}
        </p>
        <h2 className="text-[17px] font-semibold text-gray-900">
          {task.title}
        </h2>
        <p className="mt-0.5 text-[14px] text-gray-500">{task.topic}</p>
      </div>

      <div className="flex items-center border-l border-gray-200 py-4 pl-5 pr-4">
        <p className="line-clamp-3 text-[16px] leading-relaxed text-gray-600">
          {task.condition}
        </p>
      </div>

      <div className="flex min-w-[120px] items-center gap-2">
        <StatusIcon className="h-4 w-4 shrink-0" />

        <span
          className={`whitespace-nowrap text-[15px] font-medium ${statusStyles[task.status]}`}
        >
          {statusLabels[task.status]}
        </span>
      </div>

      <div className="flex items-center justify-end px-4 py-4">
        <Link
          href={`/dashboard/student/tasks/${task.id}`}
          className="flex h-9 w-[84px] items-center justify-center rounded border border-gray-300 text-[14px] font-medium text-gray-900 transition hover:bg-gray-100"
        >
          Решить
        </Link>
      </div>
    </article>
  );
};
