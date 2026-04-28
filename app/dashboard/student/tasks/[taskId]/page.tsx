import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTaskDetail } from "./_lib/getTaskDetail";
import { TaskDetailContent } from "./_components/TaskDetailContent";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  let user;

  try {
    user = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }

    throw error;
  }

  const task = await getTaskDetail(taskId, user.id);

  return <TaskDetailContent task={task} />;
}
