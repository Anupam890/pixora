import { NextResponse } from "next/server";
import { getAllCommunitySubmissions } from "@/lib/server/store";

export async function GET() {
  try {
    const submissions = getAllCommunitySubmissions();
    return NextResponse.json({ success: true, submissions });
  } catch (err: unknown) {
    console.error("Admin fetch submissions error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
