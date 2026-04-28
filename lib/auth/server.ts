import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  type SessionPayload,
  type UserSessionRole,
  verifySessionToken,
} from "@/lib/auth/session";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  role: UserSessionRole;
  isActive: boolean;
};

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function authErrorResponse(error: AuthError) {
  return NextResponse.json({ message: error.message }, { status: error.status });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = await getAuthCookie();

  return verifySessionToken(token);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError(401, "Пользователь не авторизован");
  }

  if (!user.isActive) {
    throw new AuthError(403, "Аккаунт заблокирован");
  }

  return user;
}

export async function requireRole(role: UserSessionRole) {
  const user = await requireUser();

  if (user.role !== role) {
    throw new AuthError(403, "Недостаточно прав");
  }

  return user;
}
