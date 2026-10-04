import { NextRequest, NextResponse } from "next/server";
import { completeAdSession } from "@/lib/server/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  await params;
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Missing sessionId" }, { status: 400 });
    }

    const completed = completeAdSession(sessionId);

    if (!completed) {
      return NextResponse.json({ success: false, error: "Session expired or invalid" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Ad watch confirmed and verified",
    });
  } catch (error) {
    console.error("Ad complete error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
