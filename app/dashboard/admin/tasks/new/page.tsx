import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTopicsAndSubtopics } from "../_lib/getTopicsAndSubtopics";
import { TaskForm } from "../_components/TaskForm";

export default async function NewTaskPage() {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }
    throw error;
  }

  const topics = await getTopicsAndSubtopics();
  const taskIdForUploads = `temp-${randomUUID()}`;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          Новая задача
        </h1>
        <p className="mt-1 text-[15px] text-gray-500">
          Заполните условие, ответ и при необходимости приложите изображения
        </p>
      </div>

      <TaskForm
        task={null}
        topics={topics}
        taskIdForUploads={taskIdForUploads}
      />
    </div>
  );
}
