import Link from "next/link";
import { redirect } from "next/navigation";

import { isAuthError, requireRole } from "@/lib/auth/server";
import { getAdminTasks } from "./_lib/getAdminTasks";
import { AdminTasksTable } from "./_components/AdminTasksTable";

export default async function AdminTasksPage() {
  try {
    await requireRole("ADMIN");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard");
    }
    throw error;
  }

  const tasks = await getAdminTasks();

  return (
    <div className="w-full">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
            Банк задач
          </h1>
          <p className="mt-1 text-[15px] text-gray-500">
            Создание, редактирование и публикация задач ЕГЭ
          </p>
        </div>
        <Link
          href="/dashboard/admin/tasks/new"
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Новая задача
        </Link>
      </div>

      <AdminTasksTable tasks={tasks} />
    </div>
  );
}
