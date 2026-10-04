import { NextRequest, NextResponse } from "next/server";
import { getAllPublicPrompts } from "@/lib/server/store";
import { SortOptionType } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const aiModel = searchParams.get("aiModel") || undefined;
  const style = searchParams.get("style") || undefined;
  const search = searchParams.get("search") || undefined;
  const sort = (searchParams.get("sort") as SortOptionType) || "trending";
  const featuredOnly = searchParams.get("featured") === "true";
  const trendingOnly = searchParams.get("trending") === "true";
  const unlockToken = searchParams.get("token") || undefined;

  const prompts = getAllPublicPrompts({
    category,
    aiModel,
    style,
    search,
    sort,
    featuredOnly,
    trendingOnly,
    unlockToken,
  });

  return NextResponse.json({
    success: true,
    count: prompts.length,
    prompts,
  });
}
