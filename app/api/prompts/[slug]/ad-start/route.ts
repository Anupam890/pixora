import { NextRequest, NextResponse } from "next/server";
import { getPromptBySlug, startAdSession } from "@/lib/server/store";

const SPONSORS = [
  {
    name: "Runway Gen-3 Alpha",
    tagline: "Generate photorealistic video with unprecedented motion fidelity.",
    badge: "AI Video Suite",
    cta: "Try Runway Free",
    ctaUrl: "https://runwayml.com",
    accentColor: "#6D5DFB",
  },
  {
    name: "Flux.1 Pro by Black Forest Labs",
    tagline: "The open weights frontier model setting new benchmarks in AI visual clarity.",
    badge: "Next-Gen Diffusion",
    cta: "Explore API",
    ctaUrl: "https://blackforestlabs.ai",
    accentColor: "#4F6BFF",
  },
  {
    name: "Luma Dream Machine",
    tagline: "Transform text and images into smooth, high-resolution cinematic video shots.",
    badge: "Video Intelligence",
    cta: "Create in Luma",
    ctaUrl: "https://lumalabs.ai",
    accentColor: "#E056FD",
  },
  {
    name: "Krea AI Real-time Canvas",
    tagline: "Real-time generation and upscale enhancements for professional visual artists.",
    badge: "Creative Studio",
    cta: "Launch Canvas",
    ctaUrl: "https://krea.ai",
    accentColor: "#10B981",
  },
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);

  if (!prompt) {
    return NextResponse.json({ success: false, error: "Prompt not found" }, { status: 404 });
  }

  const sessionId = startAdSession(prompt.id);
  const sponsor = SPONSORS[Math.floor(Math.random() * SPONSORS.length)];

  return NextResponse.json({
    success: true,
    sessionId,
    promptId: prompt.id,
    durationSec: 5, // 5-second rewarded ad timer for optimal user experience
    sponsor,
  });
}
