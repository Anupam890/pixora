import { NextRequest, NextResponse } from "next/server";
import { adminSavePrompt, adminDeletePrompt } from "@/lib/server/store";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.title || !data.promptText) {
      return NextResponse.json({ success: false, error: "Title and Prompt Text are required" }, { status: 400 });
    }

    const saved = adminSavePrompt(data);

    return NextResponse.json({
      success: true,
      prompt: saved,
    });
  } catch (error) {
    console.error("Admin save prompt error:", error);
    return NextResponse.json({ success: false, error: "Failed to save prompt" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Prompt id required" }, { status: 400 });
    }

    const deleted = adminDeletePrompt(id);

    return NextResponse.json({
      success: deleted,
      message: deleted ? "Prompt deleted" : "Prompt not found",
    });
  } catch (error) {
    console.error("Admin delete prompt error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete prompt" }, { status: 500 });
  }
}
