import { notFound, redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getHomeworkDetail } from "./_lib/getHomeworkDetail";
import { HomeworkDetailPage } from "./_components/HomeworkDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherHomeworkDetailRoute({ params }: PageProps) {
  let teacher;
  try {
    teacher = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const { id } = await params;

  const data = await getHomeworkDetail(id, teacher.id);
  if (!data) notFound();

  return <HomeworkDetailPage data={data} />;
}
