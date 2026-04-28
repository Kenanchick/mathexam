import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTeacherClassesData } from "./_lib/getTeacherClassesData";
import { TeacherClassesPage } from "./_components/TeacherClassesPage";

export default async function TeacherClassesRoute() {
  let user;

  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const classes = await getTeacherClassesData(user.id);

  return <TeacherClassesPage classes={classes} />;
}
