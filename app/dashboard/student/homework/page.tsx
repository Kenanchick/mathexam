import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getHomeworkData } from "./_lib/getHomeworkData";
import { HomeworkPage } from "./_components/HomeworkPage";

export default async function HomeworkRoute() {
  let user;

  try {
    user = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }

    throw error;
  }

  const data = await getHomeworkData(user.id);

  return <HomeworkPage data={data} />;
}
