import { requireRole } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export type ProfileData = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl: string | null;
  studentProfile: {
    school: string | null;
    grade: string | null;
    city: string | null;
  } | null;
  classroom: {
    id: string;
    title: string;
  } | null;
};

export async function getProfileData(): Promise<ProfileData> {
  const auth = await requireRole("STUDENT");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: auth.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      studentProfile: {
        select: { school: true, grade: true, city: true },
      },
      classMemberships: {
        where: { status: "ACTIVE" },
        take: 1,
        select: { classroom: { select: { id: true, title: true } } },
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    studentProfile: user.studentProfile,
    classroom: user.classMemberships[0]?.classroom ?? null,
  };
}
