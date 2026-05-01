import { redirect } from "next/navigation";
import { isAuthError, requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
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

  const [classes, directLinks] = await Promise.all([
    getTeacherClassesData(user.id),
    prisma.teacherStudent.findMany({
      where: { teacherId: user.id, status: "ACTIVE" },
      orderBy: { joinedAt: "desc" },
      select: {
        student: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const personalStudents = directLinks.map((l) => l.student);

  return (
    <TeacherClassesPage classes={classes} personalStudents={personalStudents} />
  );
}
