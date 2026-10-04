import { PromptItem, CategoryType, AIModelType, StyleType, SortOptionType, UserReport, AnalyticsSummary } from "../types";
import { INITIAL_PROMPTS } from "../data/prompts";

// In-memory persistent singleton for the Next.js server instance
interface GlobalState {
  prompts: PromptItem[];
  unlockedTokens: Map<string, Set<string>>; // token -> Set of unlocked prompt IDs
  reports: UserReport[];
  adSessions: Map<string, { promptId: string; completed: boolean; createdAt: number }>;
}

const globalForPixora = globalThis as unknown as { pixoraState?: GlobalState };

if (!globalForPixora.pixoraState) {
  globalForPixora.pixoraState = {
    prompts: [...INITIAL_PROMPTS],
    unlockedTokens: new Map(),
    reports: [
      {
        id: "rep-001",
        promptId: "px-003",
        promptTitle: "Minimalist Luxury Perfume in Water Ripple",
        reason: "incorrect_prompt",
        details: "Midjourney v6.1 parameter needs double dashes for raw mode.",
        userEmail: "creator@example.com",
        createdAt: "2026-10-02T11:20:00Z",
        status: "reviewed",
      },
    ],
    adSessions: new Map(),
  };
}

const state = globalForPixora.pixoraState;

/**
 * Strips confidential prompt text from a prompt item
 */
export function sanitizePublicPrompt(prompt: PromptItem, isUnlocked = false): PromptItem {
  if (isUnlocked) {
    return {
      ...prompt,
      locked: false,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { promptText, ...safePrompt } = prompt;
  return {
    ...safePrompt,
    locked: true,
  };
}

export function getAllPublicPrompts(options?: {
  category?: string;
  aiModel?: string;
  style?: string;
  search?: string;
  sort?: SortOptionType;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
  unlockToken?: string;
}): PromptItem[] {
  let list = state.prompts.filter((p) => p.isPublished);

  if (options?.category && options.category !== "All") {
    list = list.filter((p) => p.category.toLowerCase() === options.category?.toLowerCase());
  }

  if (options?.aiModel && options.aiModel !== "All") {
    list = list.filter((p) => p.aiModel.toLowerCase() === options.aiModel?.toLowerCase());
  }

  if (options?.style && options.style !== "All") {
    list = list.filter((p) => p.style.toLowerCase() === options.style?.toLowerCase());
  }

  if (options?.featuredOnly) {
    list = list.filter((p) => p.isFeatured);
  }

  if (options?.trendingOnly) {
    list = list.filter((p) => p.isTrending);
  }

  if (options?.search && options.search.trim() !== "") {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.aiModel.toLowerCase().includes(q) ||
        p.style.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sorting
  const sort = options?.sort || "trending";
  list.sort((a, b) => {
    if (sort === "most-unlocked") return b.unlockCount - a.unlockCount;
    if (sort === "most-saved") return b.favoriteCount - a.favoriteCount;
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // Default: trending
    return b.unlockCount * 2 + b.favoriteCount - (a.unlockCount * 2 + a.favoriteCount);
  });

  const unlockedSet = options?.unlockToken ? state.unlockedTokens.get(options.unlockToken) : null;

  return list.map((p) => sanitizePublicPrompt(p, unlockedSet?.has(p.id)));
}

export function getPromptBySlug(slug: string, unlockToken?: string): PromptItem | null {
  const prompt = state.prompts.find((p) => p.slug === slug);
  if (!prompt) return null;

  // Increment view count
  prompt.viewCount += 1;

  const isUnlocked = Boolean(
    unlockToken && state.unlockedTokens.get(unlockToken)?.has(prompt.id)
  );

  return sanitizePublicPrompt(prompt, isUnlocked);
}

export function getPromptById(id: string): PromptItem | null {
  return state.prompts.find((p) => p.id === id) || null;
}

export function startAdSession(promptId: string): string {
  const sessionId = "ad_sess_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
  state.adSessions.set(sessionId, {
    promptId,
    completed: false,
    createdAt: Date.now(),
  });
  return sessionId;
}

export function completeAdSession(sessionId: string): boolean {
  const session = state.adSessions.get(sessionId);
  if (!session) return false;
  session.completed = true;
  return true;
}

export function unlockPromptWithSession(
  promptId: string,
  sessionId: string,
  userToken?: string
): { success: boolean; promptText?: string; token?: string; error?: string } {
  const session = state.adSessions.get(sessionId);
  if (!session || !session.completed || session.promptId !== promptId) {
    return { success: false, error: "Invalid or incomplete ad session verification" };
  }

  const prompt = state.prompts.find((p) => p.id === promptId);
  if (!prompt) {
    return { success: false, error: "Prompt not found" };
  }

  // Increment unlock counter
  prompt.unlockCount += 1;

  // Generate or reuse token
  const token = userToken || "usr_tok_" + Math.random().toString(36).substring(2, 12);
  if (!state.unlockedTokens.has(token)) {
    state.unlockedTokens.set(token, new Set());
  }
  state.unlockedTokens.get(token)!.add(promptId);

  return {
    success: true,
    promptText: prompt.promptText,
    token,
  };
}

export function checkIsUnlocked(promptId: string, token?: string): boolean {
  if (!token) return false;
  return Boolean(state.unlockedTokens.get(token)?.has(promptId));
}

export function toggleFavorite(promptId: string, increment: boolean): number {
  const prompt = state.prompts.find((p) => p.id === promptId);
  if (!prompt) return 0;
  prompt.favoriteCount = Math.max(0, prompt.favoriteCount + (increment ? 1 : -1));
  return prompt.favoriteCount;
}

export function createReport(report: Omit<UserReport, "id" | "createdAt" | "status">): UserReport {
  const newReport: UserReport = {
    ...report,
    id: "rep-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  state.reports.unshift(newReport);
  return newReport;
}

export function getReports(): UserReport[] {
  return state.reports;
}

export function updateReportStatus(reportId: string, status: "pending" | "reviewed" | "dismissed") {
  const r = state.reports.find((x) => x.id === reportId);
  if (r) r.status = status;
}

export function adminGetAllPrompts(): PromptItem[] {
  return state.prompts;
}

export function adminSavePrompt(data: Partial<PromptItem> & { title: string; promptText: string }): PromptItem {
  if (data.id) {
    const idx = state.prompts.findIndex((p) => p.id === data.id);
    if (idx !== -1) {
      state.prompts[idx] = {
        ...state.prompts[idx],
        ...data,
      };
      return state.prompts[idx];
    }
  }

  // Create new
  const id = "px-" + String(state.prompts.length + 1).padStart(3, "0");
  const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const newPrompt: PromptItem = {
    id,
    title: data.title,
    slug,
    description: data.description || "A curated AI prompt on Pixora.",
    imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
    category: data.category || "Art",
    aiModel: data.aiModel || "Midjourney",
    style: data.style || "Photorealistic",
    aspectRatio: data.aspectRatio || "16:9",
    tags: data.tags || ["ai", "creative"],
    parameters: data.parameters || { version: "v 6.1" },
    author: data.author || {
      name: "Pixora Studio",
      handle: "@pixorastudio",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      isVerified: true,
    },
    isFeatured: Boolean(data.isFeatured),
    isTrending: Boolean(data.isTrending),
    isPublished: data.isPublished !== undefined ? data.isPublished : true,
    viewCount: 0,
    unlockCount: 0,
    favoriteCount: 0,
    createdAt: new Date().toISOString(),
    promptText: data.promptText,
  };

  state.prompts.unshift(newPrompt);
  return newPrompt;
}

export function adminDeletePrompt(id: string): boolean {
  const initialLength = state.prompts.length;
  state.prompts = state.prompts.filter((p) => p.id !== id);
  return state.prompts.length < initialLength;
}

export function getAnalytics(): AnalyticsSummary {
  const totalPrompts = state.prompts.length;
  const publishedPrompts = state.prompts.filter((p) => p.isPublished).length;
  const totalUnlocks = state.prompts.reduce((acc, p) => acc + p.unlockCount, 0);
  const totalViews = state.prompts.reduce((acc, p) => acc + p.viewCount, 0);
  const totalFavorites = state.prompts.reduce((acc, p) => acc + p.favoriteCount, 0);

  // Categories breakdown
  const categoryMap = new Map<CategoryType, number>();
  const modelMap = new Map<AIModelType, number>();

  state.prompts.forEach((p) => {
    categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    modelMap.set(p.aiModel, (modelMap.get(p.aiModel) || 0) + p.unlockCount);
  });

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const topModels = Array.from(modelMap.entries())
    .map(([model, unlocks]) => ({ model, unlocks }))
    .sort((a, b) => b.unlocks - a.unlocks);

  // Conversion rate: unlocks / views
  const unlockConversionRate = totalViews > 0 ? Number(((totalUnlocks / totalViews) * 100).toFixed(1)) : 27.4;
  // Estimated rewarded ad eCPM ($18.50 per 1000 completed ads)
  const estimatedRevenueUsd = Number(((totalUnlocks * 18.5) / 1000).toFixed(2));

  return {
    totalPrompts,
    publishedPrompts,
    totalUnlocks,
    todayUnlocks: Math.floor(totalUnlocks * 0.08),
    totalViews,
    totalFavorites,
    totalUsers: 8940,
    unlockConversionRate,
    adCompletionRate: 94.2,
    estimatedRevenueUsd,
    topCategories,
    topModels,
    recentUnlocks: [
      { promptTitle: "Cinematic Haute Couture Portrait", model: "Midjourney", timestamp: "2 mins ago" },
      { promptTitle: "Neon Cyberpunk Alley Rain Reflection", model: "Flux", timestamp: "5 mins ago" },
      { promptTitle: "Minimalist Luxury Perfume in Water Ripple", model: "Midjourney", timestamp: "8 mins ago" },
      { promptTitle: "Mechanical Swiss Chronograph Movement", model: "Stable Diffusion", timestamp: "12 mins ago" },
    ],
  };
}
