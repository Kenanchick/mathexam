import { redirect } from "next/navigation";

import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTaskForEdit } from "../../_lib/getTaskForEdit";
import { getTopicsAndSubtopics } from "../../_lib/getTopicsAndSubtopics";
import { TaskForm } from "../../_components/TaskForm";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }
    throw error;
  }

  const [task, topics] = await Promise.all([
    getTaskForEdit(taskId),
    getTopicsAndSubtopics(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          Редактирование задачи
        </h1>
        <p className="mt-1 text-[15px] text-gray-500">
          ID: <span className="font-mono">{task.id}</span>
        </p>
      </div>

      <TaskForm task={task} topics={topics} taskIdForUploads={task.id} />
    </div>
  );
}
