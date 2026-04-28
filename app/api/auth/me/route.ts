import { NextResponse } from "next/server";
import { authErrorResponse, isAuthError, requireUser } from "@/lib/auth/server";

export async function GET() {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    if (isAuthError(error)) {
      return authErrorResponse(error);
    }

    throw error;
  }

  return NextResponse.json(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    { status: 200 },
  );
}
