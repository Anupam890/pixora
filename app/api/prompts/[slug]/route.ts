import { NextRequest, NextResponse } from "next/server";
import { getPromptBySlug } from "@/lib/server/store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || undefined;

  const prompt = getPromptBySlug(slug, token);

  if (!prompt) {
    return NextResponse.json({ success: false, error: "Prompt not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    prompt,
  });
}
