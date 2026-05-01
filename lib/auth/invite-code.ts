import "server-only";
import { prisma } from "@/lib/prisma";

export type InviteCodeMatch =
  | { type: "class"; classroomId: string; teacherId: string; classroomTitle: string }
  | { type: "teacher"; teacherId: string; teacherName: string | null }
  | null;

/**
 * Resolves an invite code — checks if it's a class invite code or a teacher's personal code.
 * Returns null if not found.
 */
export async function resolveInviteCode(rawCode: string): Promise<InviteCodeMatch> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const classroom = await prisma.classroom.findUnique({
    where: { inviteCode: code },
    select: { id: true, teacherId: true, title: true, isArchived: true },
  });

  if (classroom && !classroom.isArchived) {
    return {
      type: "class",
      classroomId: classroom.id,
      teacherId: classroom.teacherId,
      classroomTitle: classroom.title,
    };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { personalInviteCode: code },
    select: { userId: true, user: { select: { name: true } } },
  });

  if (profile) {
    return {
      type: "teacher",
      teacherId: profile.userId,
      teacherName: profile.user.name,
    };
  }

  return null;
}

/**
 * Applies an invite code to newly created student — creates ClassStudent or TeacherStudent.
 * Idempotent: re-activates removed memberships.
 */
export async function applyInviteCode(
  studentId: string,
  rawCode: string,
): Promise<void> {
  const match = await resolveInviteCode(rawCode);
  if (!match) return;

  if (match.type === "class") {
    const existing = await prisma.classStudent.findUnique({
      where: { classroomId_studentId: { classroomId: match.classroomId, studentId } },
    });
    if (existing) {
      if (existing.status !== "ACTIVE") {
        await prisma.classStudent.update({
          where: { id: existing.id },
          data: { status: "ACTIVE", removedAt: null },
        });
      }
    } else {
      await prisma.classStudent.create({
        data: { classroomId: match.classroomId, studentId, status: "ACTIVE" },
      });
    }
    return;
  }

  // type === "teacher"
  const existing = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId: match.teacherId, studentId } },
  });
  if (existing) {
    if (existing.status !== "ACTIVE") {
      await prisma.teacherStudent.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", removedAt: null },
      });
    }
  } else {
    await prisma.teacherStudent.create({
      data: { teacherId: match.teacherId, studentId, status: "ACTIVE" },
    });
  }
}
