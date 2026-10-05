import { NextRequest, NextResponse } from "next/server";
import { rejectCommunitySubmission } from "@/lib/server/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let reason = "Does not meet aesthetic or prompt guidelines.";
    try {
      const body = await request.json();
      if (body.reason) reason = body.reason;
    } catch {
      // Body is optional
    }

    const submission = rejectCommunitySubmission(id, reason);
    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission marked as rejected.",
      submission,
    });
  } catch (err: unknown) {
    console.error("Reject submission error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to reject submission" },
      { status: 500 }
    );
  }
}
