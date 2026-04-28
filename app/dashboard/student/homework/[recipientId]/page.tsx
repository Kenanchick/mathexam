import { notFound, redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getHomeworkSession } from "./_lib/getHomeworkSession";
import { HomeworkSessionPage } from "./_components/HomeworkSessionPage";

interface PageProps {
  params: Promise<{ recipientId: string }>;
}

export default async function StudentHomeworkSessionRoute({ params }: PageProps) {
  let student;
  try {
    student = await requireRole("STUDENT");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/teacher");
    }
    throw error;
  }

  const { recipientId } = await params;

  const session = await getHomeworkSession(recipientId, student.id);
  if (!session) notFound();

  return <HomeworkSessionPage session={session} />;
}
