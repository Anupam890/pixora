import { NextRequest, NextResponse } from "next/server";
import { createCommunitySubmission, getAllCommunitySubmissions } from "@/lib/server/store";
import { CategoryType, AIModelType, StyleType, AspectRatioType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      promptText,
      description,
      imageUrl,
      category,
      aiModel,
      style,
      aspectRatio,
      tags,
      parameters,
      authorName,
      authorHandle,
      authorAvatar,
      userEmail,
      notes,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    if (!promptText || !promptText.trim()) {
      return NextResponse.json({ success: false, error: "Prompt text is required" }, { status: 400 });
    }

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json({ success: false, error: "Image is required" }, { status: 400 });
    }

    const cleanTags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : ["ai", "community"];

    const submission = createCommunitySubmission({
      title: title.trim(),
      promptText: promptText.trim(),
      description: description ? description.trim() : undefined,
      imageUrl: imageUrl.trim(),
      category: (category as CategoryType) || "Art",
      aiModel: (aiModel as AIModelType) || "Midjourney",
      style: (style as StyleType) || "Photorealistic",
      aspectRatio: (aspectRatio as AspectRatioType) || "16:9",
      tags: cleanTags.length > 0 ? cleanTags : ["community", "artwork"],
      parameters: parameters || {},
      author: {
        name: authorName?.trim() || "Community Creator",
        handle: authorHandle?.trim() || "@creator",
        avatar:
          authorAvatar?.trim() ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        isVerified: false,
      },
      userEmail: userEmail?.trim() || undefined,
      notes: notes?.trim() || undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Prompt submitted successfully for review.",
      submission,
    });
  } catch (err: unknown) {
    console.error("Submission API error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to submit prompt" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const handle = searchParams.get("handle")?.toLowerCase().trim();

    let list = getAllCommunitySubmissions();
    if (email) {
      list = list.filter((s) => s.userEmail?.toLowerCase() === email);
    } else if (handle) {
      list = list.filter((s) => s.author.handle.toLowerCase() === handle);
    }

    return NextResponse.json({ success: true, submissions: list });
  } catch (err: unknown) {
    console.error("Fetch submissions error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
