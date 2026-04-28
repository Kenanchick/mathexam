import { notFound, redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getReviewData } from "./_lib/getReviewData";
import { ReviewPage } from "./_components/ReviewPage";

interface PageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function TeacherReviewRoute({ params }: PageProps) {
  let teacher;
  try {
    teacher = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const { submissionId } = await params;

  const data = await getReviewData(submissionId, teacher.id);
  if (!data) notFound();

  return <ReviewPage data={data} />;
}
