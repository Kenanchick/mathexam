import Image from "next/image";
import type { TaskDetailView } from "../_lib/getTaskDetail";

type TaskMainCardProps = {
  task: TaskDetailView;
};

export const TaskMainCard = ({ task }: TaskMainCardProps) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-6">
        <h2 className="mb-4 text-xl font-bold text-gray-950">Условие задачи</h2>

        <p className="text-[17px] leading-8 text-gray-700">{task.condition}</p>

        {task.imageUrl && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
            <Image
              src={task.imageUrl}
              alt={task.title}
              width={960}
              height={540}
              className="max-h-[360px] w-full object-contain"
              unoptimized
            />
          </div>
        )}

        {!task.imageUrl && (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h3 className="mb-4 text-base font-bold text-gray-900">
              График функции
            </h3>

            <div className="flex h-[300px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-sm text-gray-400">
              Здесь позже будет изображение/график задачи
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
