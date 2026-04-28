import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { TaskDetailView } from "../_lib/getTaskDetail";

type SimilarTask = TaskDetailView["similarTasks"][number];

export const SimilarTasks = ({ tasks }: { tasks: SimilarTask[] }) => {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-gray-900">Похожие задачи</h2>

      <div className="grid grid-cols-3 gap-5">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
          >
            <h3 className="text-base font-bold text-gray-950">{task.title}</h3>

            <p className="mt-1 text-sm text-gray-500">{task.topic}</p>

            <p className="mt-4 min-h-[72px] line-clamp-3 text-sm leading-6 text-gray-600">
              {task.condition}
            </p>

            <div className="mt-5 flex items-center justify-between">
              <span
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  task.difficulty === "HARD"
                    ? "bg-red-50 text-red-600"
                    : task.difficulty === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {task.difficultyLabel}
              </span>

              <Link
                href={`/dashboard/student/tasks/${task.id}`}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Открыть
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
