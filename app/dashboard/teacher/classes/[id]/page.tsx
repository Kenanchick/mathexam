import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { getClassDetail } from "./_lib/getClassDetail";
import { ClassDetailPage } from "./_components/ClassDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClassPage({ params }: Props) {
  const { id } = await params;
  const user = await requireRole("TEACHER");

  const [cls, directLinks] = await Promise.all([
    getClassDetail(id, user.id),
    prisma.teacherStudent.findMany({
      where: { teacherId: user.id, status: "ACTIVE" },
      orderBy: { joinedAt: "desc" },
      select: {
        student: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const personalStudents = directLinks.map((l) => l.student);

  return <ClassDetailPage cls={cls} personalStudents={personalStudents} />;
}
