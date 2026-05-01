import Image from "next/image";
import { MathText } from "@/components/MathText";
import type { TaskDetailView } from "../_lib/getTaskDetail";

type TaskMainCardProps = {
  task: TaskDetailView;
};

export const TaskMainCard = ({ task }: TaskMainCardProps) => {
  const images = task.imageUrls;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-6">
        <h2 className="mb-4 text-xl font-bold text-gray-950">Условие задачи</h2>

        <MathText
          text={task.condition}
          className="block text-[17px] leading-8 text-gray-700"
        />

        {images.length > 0 && (
          <div className="mt-6 flex flex-col gap-4">
            {images.map((src, index) => (
              <div
                key={src}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
              >
                <Image
                  src={src}
                  alt={`${task.title} — рисунок ${index + 1}`}
                  width={960}
                  height={540}
                  className="max-h-[420px] w-full object-contain"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
