import { NextRequest, NextResponse } from "next/server";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await uploadImageToCloudinary(buffer);

      return NextResponse.json({
        success: true,
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
      });
    } else {
      // JSON payload with base64 data URL or external URL
      const body = await request.json();
      const { image, url } = body;
      const target = image || url;

      if (!target) {
        return NextResponse.json({ success: false, error: "Missing image data or URL" }, { status: 400 });
      }

      const result = await uploadImageToCloudinary(target);

      return NextResponse.json({
        success: true,
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        width: result.width,
        height: result.height,
      });
    }
  } catch (err: unknown) {
    console.error("Cloudinary upload API error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Image upload failed" },
      { status: 500 }
    );
  }
}
