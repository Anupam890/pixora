"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Unlock,
  Heart,
  Share2,
  Flag,
  ArrowLeft,
  Sparkles,
  Sliders,
  ExternalLink,
  Tag,
  Eye,
  Calendar,
  Layers,
  CheckCircle,
} from "lucide-react";
import { PromptItem } from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";
import { PromptViewer } from "@/components/PromptViewer";
import { AdUnlockModal } from "@/components/AdUnlockModal";
import { PromptCard } from "@/components/PromptCard";

export default function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    userToken,
    isUnlocked,
    getUnlockedText,
    isFavorite,
    toggleFavorite,
    setActiveSharePrompt,
    setActiveReportPrompt,
  } = usePixora();

  const [prompt, setPrompt] = useState<PromptItem | null>(null);
  const [relatedPrompts, setRelatedPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [localPromptText, setLocalPromptText] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrompt() {
      setLoading(true);
      try {
        const url = userToken
          ? `/api/prompts/${resolvedParams.slug}?token=${userToken}`
          : `/api/prompts/${resolvedParams.slug}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.prompt) {
          setPrompt(data.prompt);

          const cachedText = getUnlockedText(data.prompt.id);
          if (cachedText) {
            setLocalPromptText(cachedText);
          } else if (data.prompt.promptText) {
            setLocalPromptText(data.prompt.promptText);
          }

          const relRes = await fetch(`/api/prompts?category=${data.prompt.category}`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedPrompts(
              relData.prompts.filter((p: PromptItem) => p.id !== data.prompt.id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch prompt", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompt();
  }, [resolvedParams.slug, userToken]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 aspect-[4/5] rounded-3xl animate-shimmer" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 w-1/3 rounded-lg animate-shimmer" />
            <div className="h-10 w-3/4 rounded-lg animate-shimmer" />
            <div className="h-32 rounded-2xl animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <h2 className="text-2xl font-bold text-[#111111] dark:text-white">Prompt Not Found</h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#999999]">The prompt you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const unlocked = isUnlocked(prompt.id) || Boolean(localPromptText);
  const promptTextToShow = localPromptText || getUnlockedText(prompt.id) || prompt.promptText;

  const handleUnlockSuccess = (text: string) => {
    setLocalPromptText(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Main 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Visual Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full rounded-3xl overflow-hidden bg-[#F3F3F1] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#242424] shadow-sm">
            <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[580px] w-full">
              <Image
                src={prompt.imageUrl}
                alt={prompt.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>

            {/* Quick floating actions on top of image */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(prompt.id, prompt.slug)}
                className={`p-3 rounded-full backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer ${
                  isFavorite(prompt.id)
                    ? "bg-red-50 dark:bg-red-950/80 text-red-600"
                    : "bg-white/90 dark:bg-black/75 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white"
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite(prompt.id) ? "fill-red-500 text-red-500" : ""}`} />
              </button>

              <button
                onClick={() => setActiveSharePrompt(prompt)}
                className="p-3 rounded-full bg-white/90 dark:bg-black/75 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Model Badge Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/10">
                {prompt.aiModel}
              </span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/85 dark:bg-black/75 backdrop-blur-md text-[#111111] dark:text-white">
                Ratio {prompt.aspectRatio}
              </span>
            </div>
          </div>

          {/* Author & Creator Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#141414] border border-[#E8E8E5] dark:border-[#242424]">
            <div className="flex items-center gap-3">
              <img
                src={prompt.author.avatar}
                alt={prompt.author.name}
                className="w-10 h-10 rounded-full object-cover border border-[#E8E8E5] dark:border-[#282828]"
              />
              <div>
                <p className="text-xs font-bold text-[#111111] dark:text-white flex items-center gap-1">
                  <span>{prompt.author.name}</span>
                  {prompt.author.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#6D5DFB] fill-[#6D5DFB]/10" />
                  )}
                </p>
                <p className="text-[11px] text-[#6B6B6B] dark:text-[#888888]">{prompt.author.handle}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#6B6B6B] dark:text-[#888888]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#999999] dark:text-[#666666]" />
                {prompt.viewCount.toLocaleString()} views
              </span>
              <button
                onClick={() => setActiveReportPrompt(prompt)}
                className="hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Report issue"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata, Description & Unlock Container */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link
                href={`/category/${prompt.category.toLowerCase()}`}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F3F3F1] dark:bg-[#1C1C1C] hover:bg-[#EBEBE7] dark:hover:bg-[#252525] text-[#111111] dark:text-white transition-colors"
              >
                {prompt.category}
              </Link>
              <Link
                href={`/ai/${prompt.aiModel.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBEBE7] dark:bg-[#222222] hover:bg-[#D5D5D0] dark:hover:bg-[#2A2A2A] text-[#111111] dark:text-white transition-colors"
              >
                {prompt.aiModel}
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-tight">
              {prompt.title}
            </h1>

            <p className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Prompt Container: Locked vs Unlocked */}
          {unlocked && promptTextToShow ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D5DFB] flex items-center gap-1.5">
                  <Unlock className="w-4 h-4" />
                  <span>Prompt Unlocked & Ready</span>
                </span>
                <span className="text-xs text-[#6B6B6B] dark:text-[#888888]">
                  {prompt.unlockCount.toLocaleString()} creators unlocked
                </span>
              </div>

              {/* Code viewer */}
              <PromptViewer prompt={prompt} promptText={promptTextToShow} />
            </div>
          ) : (
            /* Locked Prompt State */
            <div className="rounded-3xl border-2 border-dashed border-[#D5D5D0] dark:border-[#2C2C2C] bg-white dark:bg-[#141414] p-6 sm:p-8 text-center space-y-6 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#111111] dark:text-white">
                  Complete Prompt is Locked
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#9E9E9E] max-w-sm mx-auto leading-relaxed">
                  Watch a short 5-second sponsor advertisement to reveal the complete prompt, stylize weights, negative prompt, and seeds.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#111111] dark:bg-white hover:bg-[#2A2A2A] dark:hover:bg-gray-100 text-white dark:text-[#111111] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400 dark:text-amber-600 group-hover:scale-110 transition-transform" />
                  <span>Watch Ad to Unlock Prompt</span>
                </button>
                <p className="text-[11px] text-[#999999] dark:text-[#666666]">Takes only 5 seconds · Free access</p>
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#888888] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Prompt Keywords & Tags</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] hover:bg-[#F3F3F1] dark:hover:bg-[#1E1E1E] text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white border border-[#E8E8E5] dark:border-[#262626] transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Prompts Section */}
      {relatedPrompts.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#E8E8E5] dark:border-[#222222]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#111111] dark:text-white">Similar & Related Prompts</h3>
              <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">Explore more from the {prompt.category} collection.</p>
            </div>
            <Link
              href={`/category/${prompt.category.toLowerCase()}`}
              className="text-xs font-semibold text-[#6D5DFB] hover:underline"
            >
              View all in {prompt.category} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedPrompts.map((rel) => (
              <PromptCard key={rel.id} prompt={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Ad Unlock Modal */}
      <AdUnlockModal
        prompt={prompt}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </div>
  );
}
