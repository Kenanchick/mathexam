import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getStudentDashboard } from "./_lib/getStudentDashboard";
import { MainContent } from "./_components/MainContent";

export default async function StudentDashboardPage() {
  let user;

  try {
    user = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }

    throw error;
  }

  const dashboard = await getStudentDashboard(user.id);

  return <MainContent dashboard={dashboard} />;
}
