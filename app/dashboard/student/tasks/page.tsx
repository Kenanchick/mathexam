import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTasksCatalog } from "./_lib/getTasksCatalog";
import { TasksCatalogContent } from "./_components/TaskCatalogContent";

export default async function StudentTasksPage() {
  let user;

  try {
    user = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }

    throw error;
  }

  const catalog = await getTasksCatalog(user.id);

  return <TasksCatalogContent catalog={catalog} />;
}
