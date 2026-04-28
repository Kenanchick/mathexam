import { TaskMainCard } from "./TaskMainCard";
import { AnswerCard } from "./AnswerCard";
import { TaskInfoAside } from "./TaskInfoAside";
import { SimilarTasks } from "./SimilarTasks";
import type { TaskDetailView } from "../_lib/getTaskDetail";

export const TaskDetailContent = ({ task }: { task: TaskDetailView }) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-4 text-sm font-medium text-gray-500">
          Каталог задач / {task.title} / {task.topic}
        </p>

        <h1 className="text-3xl font-bold tracking-[-0.03em] text-gray-950">
          {task.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {task.topic}
          </span>

          <span className="rounded-xl bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-800">
            {task.difficultyLabel} сложность
          </span>

          <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
            ЕГЭ профиль
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div className="space-y-5">
          <TaskMainCard task={task} />
          <AnswerCard taskId={task.id} />
        </div>

        <TaskInfoAside task={task} attempts={task.attempts} />
      </div>

      <SimilarTasks tasks={task.similarTasks} />
    </div>
  );
};
