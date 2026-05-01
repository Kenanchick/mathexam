import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TasksCatalogView } from "../_lib/getTasksCatalog";

type CatalogProgressAsideProps = {
  progress: TasksCatalogView["progress"];
};

export const CatalogProgressAside = ({
  progress,
}: CatalogProgressAsideProps) => {
  return (
    <aside className="h-fit rounded border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
        <h2 className="text-[16px] font-semibold text-gray-900">
          Ваш прогресс
        </h2>
      </div>

      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[15px] text-gray-700">
            Решено {progress.solved} из {progress.total}
          </p>
          <span className="text-[15px] font-semibold text-gray-900">
            {progress.percent}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-sm bg-gray-200">
          <div
            className="h-full bg-gray-600"
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 divide-x divide-gray-200 rounded border border-gray-200">
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-gray-900">
              {progress.solved}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">Решено</p>
          </div>
          <div className="px-3 py-3 text-center">
            <p className="text-[18px] font-semibold text-gray-900">
              {progress.unsolved}
            </p>
            <p className="mt-0.5 text-[12px] text-gray-500">Нерешено</p>
          </div>
        </div>
      </div>

      <Link
        href="/dashboard/student/progress"
        className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-[14px] text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
      >
        Перейти к прогрессу
        <ChevronRight className="h-4 w-4" />
      </Link>
    </aside>
  );
};
