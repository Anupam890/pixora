import { NextRequest, NextResponse } from "next/server";
import { unlockPromptWithSession, getPromptBySlug } from "@/lib/server/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await request.json();
    const { sessionId, userToken } = body;

    const currentPrompt = getPromptBySlug(slug);
    if (!currentPrompt) {
      return NextResponse.json({ success: false, error: "Prompt not found" }, { status: 404 });
    }

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Ad sessionId is required" }, { status: 400 });
    }

    const result = unlockPromptWithSession(currentPrompt.id, sessionId, userToken);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Unlock verification failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      promptText: result.promptText,
      token: result.token,
      unlockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Unlock error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
