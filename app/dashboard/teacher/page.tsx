import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTeacherDashboardData } from "./_lib/getTeacherDashboardData";
import { TeacherDashboardPage } from "./_components/TeacherDashboardPage";

export default async function TeacherDashboardRoute() {
  let user;

  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }

    throw error;
  }

  const data = await getTeacherDashboardData(user.id);

  return <TeacherDashboardPage data={data} />;
}
