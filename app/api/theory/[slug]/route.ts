import { NextRequest, NextResponse } from "next/server";
import { getTheoryQuizBySlug } from "@/app/dashboard/student/theory/_lib/getTheoryQuizzes";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const quiz = await getTheoryQuizBySlug(slug);

  if (!quiz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(quiz);
}
