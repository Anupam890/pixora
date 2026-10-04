import { NextRequest, NextResponse } from "next/server";
import { createReport, getReports, updateReportStatus } from "@/lib/server/store";

export async function GET() {
  const reports = getReports();
  return NextResponse.json({ success: true, reports });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, promptTitle, reason, details, userEmail } = body;

    if (!promptId || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const report = createReport({
      promptId,
      promptTitle: promptTitle || "Untitled Prompt",
      reason,
      details,
      userEmail,
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json({ success: false, error: "Missing reportId or status" }, { status: 400 });
    }

    updateReportStatus(reportId, status);
    return NextResponse.json({ success: true, message: "Report status updated" });
  } catch (error) {
    console.error("Report update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
