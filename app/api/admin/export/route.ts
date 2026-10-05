import { NextResponse } from "next/server";
import { exportFullDatabase } from "@/lib/server/store";

export async function GET() {
  try {
    const data = exportFullDatabase();
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="pixora-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err: unknown) {
    console.error("Export database error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to export database" },
      { status: 500 }
    );
  }
}
