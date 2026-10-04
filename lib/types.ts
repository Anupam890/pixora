export type CategoryType =
  | "Portrait"
  | "Photography"
  | "Fashion"
  | "Product"
  | "Cinematic"
  | "Anime"
  | "3D"
  | "Fantasy"
  | "Interior"
  | "Art"
  | "Social Media"
  | "E-commerce";

export type AIModelType =
  | "Midjourney"
  | "ChatGPT Image"
  | "Gemini"
  | "Flux"
  | "Stable Diffusion"
  | "Ideogram"
  | "Leonardo"
  | "Other";

export type StyleType =
  | "Photorealistic"
  | "Cinematic"
  | "Minimal"
  | "Editorial"
  | "Luxury"
  | "Vintage"
  | "Anime"
  | "3D"
  | "Illustration"
  | "Surreal";

export type AspectRatioType = "1:1" | "16:9" | "9:16" | "4:5" | "3:2" | "2:3";

export type SortOptionType = "trending" | "most-unlocked" | "most-saved" | "newest";

export interface PromptParameters {
  seed?: number;
  cfgScale?: number;
  sampler?: string;
  steps?: number;
  stylize?: number;
  chaos?: number;
  version?: string;
  negativePrompt?: string;
  rawMode?: boolean;
}

export interface PromptAuthor {
  name: string;
  handle: string;
  avatar: string;
  isVerified?: boolean;
}

export interface PromptItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category: CategoryType;
  aiModel: AIModelType;
  style: StyleType;
  aspectRatio: AspectRatioType;
  tags: string[];
  parameters?: PromptParameters;
  author: PromptAuthor;
  isFeatured: boolean;
  isTrending: boolean;
  isPublished: boolean;
  viewCount: number;
  unlockCount: number;
  favoriteCount: number;
  createdAt: string;
  // Security rule: promptText is only sent when unlocked!
  promptText?: string;
  locked?: boolean;
}

export interface AdSession {
  sessionId: string;
  promptId: string;
  sponsorName: string;
  sponsorTagline: string;
  sponsorLogoUrl?: string;
  videoDurationSec: number;
  createdAt: number;
  completedAt?: number;
  verified: boolean;
}

export interface UserCollection {
  id: string;
  name: string;
  description?: string;
  promptIds: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserReport {
  id: string;
  promptId: string;
  promptTitle: string;
  reason: "incorrect_prompt" | "copyright" | "nsfw" | "spam" | "broken_image" | "misleading";
  details?: string;
  userEmail?: string;
  createdAt: string;
  status: "pending" | "reviewed" | "dismissed";
}

export interface AnalyticsSummary {
  totalPrompts: number;
  publishedPrompts: number;
  totalUnlocks: number;
  todayUnlocks: number;
  totalViews: number;
  totalFavorites: number;
  totalUsers: number;
  unlockConversionRate: number;
  adCompletionRate: number;
  estimatedRevenueUsd: number;
  topCategories: { category: CategoryType; count: number }[];
  topModels: { model: AIModelType; unlocks: number }[];
  recentUnlocks: { promptTitle: string; model: AIModelType; timestamp: string }[];
}
