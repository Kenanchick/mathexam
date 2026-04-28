import { NextResponse } from "next/server";

export async function parseJsonRequest(req: Request) {
  try {
    return {
      success: true as const,
      data: await req.json(),
    };
  } catch {
    return {
      success: false as const,
      response: NextResponse.json(
        { message: "Некорректный JSON в теле запроса" },
        { status: 400 },
      ),
    };
  }
}
