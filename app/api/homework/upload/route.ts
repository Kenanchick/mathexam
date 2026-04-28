import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Поддерживаются только JPEG, PNG, WEBP, HEIC и PDF" },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Файл слишком большой. Максимум 10 МБ" },
      { status: 400 },
    );
  }

  // TODO: replace with real S3/R2/Cloudflare upload
  // const buffer = Buffer.from(await file.arrayBuffer());
  // const url = await uploadToStorage(buffer, file.name, file.type);

  const placeholderUrl = `/uploads/homework/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  return NextResponse.json({ url: placeholderUrl });
}
