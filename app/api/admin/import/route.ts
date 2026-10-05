import { NextRequest, NextResponse } from "next/server";
import { importFullDatabase } from "@/lib/server/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = importFullDatabase(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid backup format. Expected 'prompts' array." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Database imported successfully. ${result.importedPrompts} prompts, ${result.importedSubmissions} submissions restored.`,
      result,
    });
  } catch (err: unknown) {
    console.error("Import database error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to import database" },
      { status: 500 }
    );
  }
}
