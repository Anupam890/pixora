import fs from "fs";
import path from "path";
import {
  PromptItem,
  CategoryType,
  AIModelType,
  SortOptionType,
  UserReport,
  AnalyticsSummary,
  CommunitySubmission,
} from "../types";
import { INITIAL_PROMPTS } from "../data/prompts";

// File path for database persistence
const DB_FILE_PATH = path.join(process.cwd(), "lib", "data", "pixora-db.json");

interface GlobalState {
  prompts: PromptItem[];
  submissions: CommunitySubmission[];
  reports: UserReport[];
  unlockedTokens: Map<string, Set<string>>; // token -> Set of unlocked prompt IDs
  adSessions: Map<string, { promptId: string; completed: boolean; createdAt: number }>;
}

const INITIAL_SUBMISSIONS: CommunitySubmission[] = [
  {
    id: "sub-101",
    title: "Ethereal Glass Butterfly in Bioluminescent Moss",
    promptText:
      "Macro photography of a translucent crystal glass butterfly resting on glowing bioluminescent emerald moss, misty morning dew droplets, prismatic rainbow refraction, soft focus bokeh background, 100mm f/2.8 macro lens --ar 16:9 --style raw --v 6.1 --stylize 280",
    description: "Intricate macro concept featuring crystal transparency and nature caustics.",
    imageUrl:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=85",
    category: "Photography",
    aiModel: "Midjourney",
    style: "Photorealistic",
    aspectRatio: "16:9",
    tags: ["macro", "butterfly", "crystal", "bioluminescence", "dew"],
    parameters: {
      version: "v 6.1",
      stylize: 280,
      chaos: 10,
      cfgScale: 7.0,
      rawMode: true,
      negativePrompt: "lowres, plastic, blurry, oversaturated, deformed",
    },
    author: {
      name: "Aria Thorne",
      handle: "@ariathorne",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      isVerified: true,
    },
    userEmail: "aria.thorne@example.com",
    notes: "Tested extensively in Midjourney v6.1; renders exceptionally crisp crystal refraction.",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "sub-102",
    title: "Retro 80s Anime Synthwave Horizon",
    promptText:
      "Vintage 1988 retro anime aesthetic screencap of an aesthetic sports car driving towards a gigantic digital wireframe sun on a purple neon grid highway, starry twilight sky, VHS cassette scanlines, grain texture, cel animation by Studio Gainax --ar 16:9 --v 6.1",
    description: "Outrun and synthwave nostalgia with authentic 1980s cel-shaded rendering.",
    imageUrl:
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=85",
    category: "Anime",
    aiModel: "Midjourney",
    style: "Vintage",
    aspectRatio: "16:9",
    tags: ["synthwave", "retro", "anime", "80s", "outrun", "cyberpunk"],
    parameters: {
      version: "v 6.1",
      stylize: 200,
      negativePrompt: "3d render, photorealistic, modern digital art",
    },
    author: {
      name: "Leo Vance",
      handle: "@vancerecord",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      isVerified: false,
    },
    userEmail: "leo@vancestudios.design",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const INITIAL_REPORTS: UserReport[] = [
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
];

// Helper to save state to disk
function saveStateToDisk(prompts: PromptItem[], submissions: CommunitySubmission[], reports: UserReport[]) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = JSON.stringify({ prompts, submissions, reports }, null, 2);
    fs.writeFileSync(DB_FILE_PATH, data, "utf8");
  } catch (err) {
    console.error("Failed to write pixora-db.json:", err);
  }
}

// Helper to load state from disk
function loadStateFromDisk(): {
  prompts: PromptItem[];
  submissions: CommunitySubmission[];
  reports: UserReport[];
} {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.prompts)) {
        return {
          prompts: parsed.prompts,
          submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [...INITIAL_SUBMISSIONS],
          reports: Array.isArray(parsed.reports) ? parsed.reports : [...INITIAL_REPORTS],
        };
      }
    }
  } catch (err) {
    console.warn("Could not load pixora-db.json, falling back to initial data:", err);
  }

  // First boot: create file
  const initial = {
    prompts: [...INITIAL_PROMPTS],
    submissions: [...INITIAL_SUBMISSIONS],
    reports: [...INITIAL_REPORTS],
  };
  saveStateToDisk(initial.prompts, initial.submissions, initial.reports);
  return initial;
}

// In-memory persistent singleton for the Next.js server instance
const globalForPixora = globalThis as unknown as { pixoraState?: GlobalState };

if (!globalForPixora.pixoraState || !globalForPixora.pixoraState.submissions) {
  const loaded = loadStateFromDisk();
  globalForPixora.pixoraState = {
    prompts: loaded.prompts,
    submissions: loaded.submissions,
    reports: loaded.reports,
    unlockedTokens: new Map(),
    adSessions: new Map(),
  };
}

const state = globalForPixora.pixoraState;

function persist() {
  saveStateToDisk(state.prompts, state.submissions, state.reports);
}

// Immediate initial sync
persist();

/**
 * Strips confidential prompt text from a prompt item unless unlocked
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
    return b.favoriteCount * 2 + b.viewCount - (a.favoriteCount * 2 + a.viewCount);
  });

  const unlockedSet = options?.unlockToken ? state.unlockedTokens.get(options.unlockToken) : null;

  return list.map((p) => sanitizePublicPrompt(p, unlockedSet?.has(p.id)));
}

export function getPromptBySlug(slug: string, unlockToken?: string): PromptItem | null {
  const prompt = state.prompts.find((p) => p.slug === slug);
  if (!prompt) return null;

  // Increment view count
  prompt.viewCount += 1;
  persist();

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
  persist();

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
  persist();
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
  persist();
  return newReport;
}

export function getReports(): UserReport[] {
  return state.reports;
}

export function updateReportStatus(reportId: string, status: "pending" | "reviewed" | "dismissed") {
  const r = state.reports.find((x) => x.id === reportId);
  if (r) {
    r.status = status;
    persist();
  }
}

// -------------------------------------------------------------
// COMMUNITY SUBMISSIONS
// -------------------------------------------------------------
export function createCommunitySubmission(
  sub: Omit<CommunitySubmission, "id" | "createdAt" | "status">
): CommunitySubmission {
  const newSubmission: CommunitySubmission = {
    ...sub,
    id: "sub-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  state.submissions.unshift(newSubmission);
  persist();
  return newSubmission;
}

export function getAllCommunitySubmissions(): CommunitySubmission[] {
  return state.submissions;
}

export function getPendingCommunitySubmissions(): CommunitySubmission[] {
  return state.submissions.filter((s) => s.status === "pending");
}

export function approveCommunitySubmission(
  submissionId: string,
  overrides?: Partial<PromptItem>
): { prompt: PromptItem; submission: CommunitySubmission } | null {
  const sub = state.submissions.find((s) => s.id === submissionId);
  if (!sub) return null;

  sub.status = "approved";
  sub.reviewedAt = new Date().toISOString();

  // Convert submission into a live PromptItem in the catalog
  const id = "px-" + String(state.prompts.length + 1).padStart(3, "0");
  const slug =
    (overrides?.slug || sub.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6);

  const newPrompt: PromptItem = {
    id,
    title: overrides?.title || sub.title,
    slug,
    description: overrides?.description || sub.description || "A community-curated AI prompt on Pixora.",
    imageUrl: overrides?.imageUrl || sub.imageUrl,
    category: overrides?.category || sub.category,
    aiModel: overrides?.aiModel || sub.aiModel,
    style: overrides?.style || sub.style,
    aspectRatio: overrides?.aspectRatio || sub.aspectRatio,
    tags: overrides?.tags || sub.tags,
    parameters: overrides?.parameters || sub.parameters || { version: "v 6.1" },
    author: overrides?.author || sub.author,
    isFeatured: Boolean(overrides?.isFeatured),
    isTrending: true,
    isPublished: true,
    viewCount: 0,
    unlockCount: 0,
    favoriteCount: 0,
    createdAt: new Date().toISOString(),
    promptText: overrides?.promptText || sub.promptText,
  };

  state.prompts.unshift(newPrompt);
  persist();

  return { prompt: newPrompt, submission: sub };
}

export function rejectCommunitySubmission(
  submissionId: string,
  reason?: string
): CommunitySubmission | null {
  const sub = state.submissions.find((s) => s.id === submissionId);
  if (!sub) return null;

  sub.status = "rejected";
  sub.rejectionReason = reason || "Does not meet community aesthetic or formatting standards.";
  sub.reviewedAt = new Date().toISOString();
  persist();

  return sub;
}

// -------------------------------------------------------------
// ADMIN CRUD & DATABASE BACKUP / IMPORT
// -------------------------------------------------------------
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
      persist();
      return state.prompts[idx];
    }
  }

  // Create new prompt
  const id = "px-" + String(state.prompts.length + 1).padStart(3, "0");
  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const newPrompt: PromptItem = {
    id,
    title: data.title,
    slug,
    description: data.description || "A curated AI prompt on Pixora.",
    imageUrl:
      data.imageUrl ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85",
    category: data.category || "Art",
    aiModel: data.aiModel || "Midjourney",
    style: data.style || "Photorealistic",
    aspectRatio: data.aspectRatio || "16:9",
    tags: data.tags || ["ai", "creative"],
    parameters: data.parameters || { version: "v 6.1" },
    author: data.author || {
      name: "Pixora Studio",
      handle: "@pixorastudio",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
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
  persist();
  return newPrompt;
}

export function adminDeletePrompt(id: string): boolean {
  const initialLength = state.prompts.length;
  state.prompts = state.prompts.filter((p) => p.id !== id);
  const changed = state.prompts.length < initialLength;
  if (changed) persist();
  return changed;
}

export function exportFullDatabase(): {
  prompts: PromptItem[];
  submissions: CommunitySubmission[];
  reports: UserReport[];
  exportedAt: string;
} {
  return {
    prompts: state.prompts,
    submissions: state.submissions,
    reports: state.reports,
    exportedAt: new Date().toISOString(),
  };
}

export function importFullDatabase(imported: {
  prompts?: PromptItem[];
  submissions?: CommunitySubmission[];
  reports?: UserReport[];
}): { success: boolean; importedPrompts: number; importedSubmissions: number } {
  if (!imported || !Array.isArray(imported.prompts)) {
    return { success: false, importedPrompts: 0, importedSubmissions: 0 };
  }

  state.prompts = imported.prompts;
  if (Array.isArray(imported.submissions)) {
    state.submissions = imported.submissions;
  }
  if (Array.isArray(imported.reports)) {
    state.reports = imported.reports;
  }

  persist();
  return {
    success: true,
    importedPrompts: state.prompts.length,
    importedSubmissions: state.submissions.length,
  };
}

export function getAnalytics(): AnalyticsSummary {
  const totalPrompts = state.prompts.length;
  const publishedPrompts = state.prompts.filter((p) => p.isPublished).length;
  const pendingSubmissions = state.submissions.filter((s) => s.status === "pending").length;
  const totalSubmissions = state.submissions.length;
  const totalViews = state.prompts.reduce((acc, p) => acc + p.viewCount, 0);
  const totalFavorites = state.prompts.reduce((acc, p) => acc + p.favoriteCount, 0);
  const totalReports = state.reports.length;

  // Categories breakdown
  const categoryMap = new Map<CategoryType, number>();
  const modelMap = new Map<AIModelType, number>();

  state.prompts.forEach((p) => {
    categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + 1);
    modelMap.set(p.aiModel, (modelMap.get(p.aiModel) || 0) + 1);
  });

  const topCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const topModels = Array.from(modelMap.entries())
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count);

  const recentActivity: { title: string; type: "submission" | "published" | "report"; timestamp: string }[] = [];

  state.submissions.slice(0, 3).forEach((s) => {
    recentActivity.push({
      title: `Submission: "${s.title}" (${s.status})`,
      type: "submission",
      timestamp: s.createdAt,
    });
  });

  state.prompts.slice(0, 3).forEach((p) => {
    recentActivity.push({
      title: `Prompt: "${p.title}"`,
      type: "published",
      timestamp: p.createdAt,
    });
  });

  return {
    totalPrompts,
    publishedPrompts,
    pendingSubmissions,
    totalSubmissions,
    totalViews,
    totalFavorites,
    totalReports,
    totalUsers: 8940,
    topCategories,
    topModels,
    recentActivity,
  };
}
