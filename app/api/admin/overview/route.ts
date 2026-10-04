import { NextResponse } from "next/server";
import { getAnalytics, adminGetAllPrompts, getReports } from "@/lib/server/store";

export async function GET() {
  const analytics = getAnalytics();
  const prompts = adminGetAllPrompts();
  const reports = getReports();

  return NextResponse.json({
    success: true,
    analytics,
    prompts,
    reports,
  });
}
