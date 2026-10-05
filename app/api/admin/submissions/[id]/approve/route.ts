import { NextRequest, NextResponse } from "next/server";
import { approveCommunitySubmission } from "@/lib/server/store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let overrides = {};
    try {
      const body = await request.json();
      overrides = body.overrides || {};
    } catch {
      // Body is optional
    }

    const result = approveCommunitySubmission(id, overrides);
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Submission approved and published to catalog.",
      prompt: result.prompt,
      submission: result.submission,
    });
  } catch (err: unknown) {
    console.error("Approve submission error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to approve submission" },
      { status: 500 }
    );
  }
}
