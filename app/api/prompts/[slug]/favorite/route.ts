import { NextRequest, NextResponse } from "next/server";
import { getPromptBySlug, toggleFavorite } from "@/lib/server/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const { increment } = body;

    const prompt = getPromptBySlug(slug);
    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt not found" }, { status: 404 });
    }

    const newFavoriteCount = toggleFavorite(prompt.id, Boolean(increment));

    return NextResponse.json({
      success: true,
      favoriteCount: newFavoriteCount,
    });
  } catch (error) {
    console.error("Favorite toggle error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
