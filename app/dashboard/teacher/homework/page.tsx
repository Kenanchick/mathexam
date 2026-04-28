import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getTeacherHomeworkList } from "./_lib/getTeacherHomeworkList";
import { HomeworkListPage } from "./_components/HomeworkListPage";

export default async function TeacherHomeworkRoute() {
  let user;

  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const homeworks = await getTeacherHomeworkList(user.id);

  return <HomeworkListPage homeworks={homeworks} />;
}
