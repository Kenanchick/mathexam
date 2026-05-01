import { requireRole } from "@/lib/auth/server";
import { getTeacherStudents } from "./_lib/getTeacherStudents";
import { StudentsPage } from "./_components/StudentsPage";
import { prisma } from "@/lib/prisma";

export default async function TeacherStudentsPage() {
  const user = await requireRole("TEACHER");

  const [students, classrooms, profile] = await Promise.all([
    getTeacherStudents(user.id),
    prisma.classroom.findMany({
      where: { teacherId: user.id, isArchived: false },
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    }),
    prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { personalInviteCode: true },
    }),
  ]);

  return (
    <StudentsPage
      students={students}
      classrooms={classrooms}
      initialInviteCode={profile?.personalInviteCode ?? null}
    />
  );
}
