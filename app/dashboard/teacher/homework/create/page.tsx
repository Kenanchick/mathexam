import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { getCreateHomeworkData } from "./_lib/getCreateHomeworkData";
import { CreateHomeworkContainer } from "./_components/CreateHomeworkContainer";

interface Props {
  searchParams: Promise<{ classId?: string }>;
}

export default async function CreateHomeworkRoute({ searchParams }: Props) {
  let user;

  try {
    user = await requireRole("TEACHER");
  } catch (error) {
    if (isAuthError(error)) {
      redirect(error.status === 401 ? "/login" : "/dashboard/student");
    }
    throw error;
  }

  const { classId } = await searchParams;
  const data = await getCreateHomeworkData(user.id);

  const initialClassroomId =
    classId && data.classrooms.some((c) => c.id === classId) ? classId : null;

  return (
    <CreateHomeworkContainer
      data={data}
      initialClassroomId={initialClassroomId}
    />
  );
}
