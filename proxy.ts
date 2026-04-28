import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/dashboard/teacher") && session.role === "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard/student", req.url));
  }

  if (pathname.startsWith("/dashboard/student") && session.role === "TEACHER") {
    return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
