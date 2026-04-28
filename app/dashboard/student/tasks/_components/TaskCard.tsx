import Link from "next/link";
import { AlertCircle, Bookmark, CheckCircle2, Circle } from "lucide-react";
import type {
  CatalogTaskProgressStatus,
  CatalogTaskView,
} from "../_lib/getTasksCatalog";

type TaskCardProps = {
  task: CatalogTaskView;
};

const difficultyStyles = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-50 text-red-600",
};

const statusLabels: Record<CatalogTaskProgressStatus, string> = {
  solved: "Решено",
  unsolved: "Не решено",
  error: "С ошибками",
};

const statusStyles: Record<CatalogTaskProgressStatus, string> = {
  solved: "text-emerald-600",
  unsolved: "text-gray-500",
  error: "text-red-500",
};

const statusIcons = {
  solved: CheckCircle2,
  unsolved: Circle,
  error: AlertCircle,
};

function getAttemptLabel(count: number) {
  if (count === 1) return "1 попытка";
  if (count >= 2 && count <= 4) return `${count} попытки`;
  return `${count} попыток`;
}

export const TaskCard = ({ task }: TaskCardProps) => {
  const StatusIcon = statusIcons[task.status];

  return (
    <article className="grid min-h-[118px] grid-cols-[170px_1fr_130px_140px] items-center rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div>
        <h2 className="text-xl font-bold text-gray-950">{task.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{task.topic}</p>

        <span
          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            difficultyStyles[task.difficulty]
          }`}
        >
          {task.difficultyLabel}
        </span>
      </div>

      <div className="border-l border-gray-200 pl-7 pr-6">
        <p className="line-clamp-3 text-[15px] leading-relaxed text-gray-700">
          {task.condition}
        </p>
      </div>

      <div>
        <div
          className={`flex items-center gap-2 text-sm font-medium ${
            statusStyles[task.status]
          }`}
        >
          <StatusIcon className="h-5 w-5" />
          {statusLabels[task.status]}
        </div>

        <p className="mt-5 text-sm text-gray-500">
          {getAttemptLabel(task.attempts)}
        </p>
      </div>

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          className="text-gray-400 transition hover:text-blue-600"
        >
          <Bookmark className="h-6 w-6" />
        </button>

        <Link
          href={`/dashboard/student/tasks/${task.id}`}
          className="flex h-11 w-[100px] items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Решить
        </Link>
      </div>
    </article>
  );
};
