import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { TasksCatalogView } from "../_lib/getTasksCatalog";

type CatalogProgressAsideProps = {
  progress: TasksCatalogView["progress"];
};

export const CatalogProgressAside = ({
  progress,
}: CatalogProgressAsideProps) => {
  return (
    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">
        Ваш прогресс по каталогу
      </h2>

      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900">
            Решено {progress.solved} из {progress.total}
          </p>
          <span className="text-base font-semibold text-gray-900">
            {progress.percent}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 rounded-xl border border-gray-200">
        <ProgressMiniStat
          value={String(progress.solved)}
          label="Решено"
          color="green"
        />
        <ProgressMiniStat
          value={String(progress.unsolved)}
          label="Не решено"
          color="gray"
        />
        <ProgressMiniStat
          value={String(progress.withErrors)}
          label="С ошибками"
          color="red"
        />
      </div>

      <div className="mt-7 border-t border-gray-200 pt-6">
        <h3 className="mb-5 text-lg font-bold text-gray-900">Слабые темы</h3>

        {progress.weakTopics.length === 0 && (
          <p className="text-sm text-gray-500">
            Пока недостаточно данных для анализа.
          </p>
        )}

        <div className="space-y-5">
          {progress.weakTopics.map((topic) => (
            <div key={topic.title} className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                <BookOpen className="h-7 w-7" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                  <span className="text-sm text-gray-500">
                    {topic.percent}%
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  Решено {topic.solved} из {topic.total}
                </p>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{ width: `${topic.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/dashboard/student/progress"
        className="mt-7 flex h-12 items-center justify-center gap-3 rounded-xl border border-gray-200 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
      >
        Перейти к прогрессу
        <ArrowRight className="h-5 w-5" />
      </Link>
    </aside>
  );
};

function ProgressMiniStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: "green" | "gray" | "red";
}) {
  const colorClass =
    color === "green"
      ? "text-emerald-600"
      : color === "red"
        ? "text-red-500"
        : "text-gray-600";

  return (
    <div className="border-r border-gray-200 px-3 py-4 text-center last:border-r-0">
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
