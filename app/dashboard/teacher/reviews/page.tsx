import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getAllPendingReviews } from "./_lib/getAllPendingReviews";
import { ReviewsListPage } from "./_components/ReviewsListPage";

export default async function TeacherReviewsRoute() {
  let teacher;
  try {
    teacher = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const reviews = await getAllPendingReviews(teacher.id);

  return <ReviewsListPage reviews={reviews} />;
}
