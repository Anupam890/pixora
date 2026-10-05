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
        <h2 className="text-2xl font-bold text-[#1C143B] dark:text-[#F3F0FF]">Prompt Not Found</h2>
        <p className="text-sm text-[#584F7C] dark:text-[#A59ECA]">The prompt you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/25"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#584F7C] dark:text-[#A59ECA] hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>
      </div>

      {/* Main 2-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Visual Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full rounded-3xl overflow-hidden bg-[#ECE8FB] dark:bg-[#120D26] border border-[#DDD6FE]/70 dark:border-[#271E4C] shadow-lg shadow-[#8B5CF6]/5">
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
                    ? "bg-red-50 dark:bg-red-950/80 text-red-500"
                    : "bg-white/90 dark:bg-[#161133]/90 hover:bg-white dark:hover:bg-[#1F1746] text-[#1C143B] dark:text-[#F3F0FF]"
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite(prompt.id) ? "fill-red-500 text-red-500" : ""}`} />
              </button>

              <button
                onClick={() => setActiveSharePrompt(prompt)}
                className="p-3 rounded-full bg-white/90 dark:bg-[#161133]/90 hover:bg-white dark:hover:bg-[#1F1746] text-[#1C143B] dark:text-[#F3F0FF] backdrop-blur-md shadow-md transition-all active:scale-95 cursor-pointer"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Model Badge Overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#090714]/80 backdrop-blur-md text-[#F3F0FF] border border-white/10">
                {prompt.aiModel}
              </span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#161133]/90 backdrop-blur-md text-[#1C143B] dark:text-[#F3F0FF]">
                Ratio {prompt.aspectRatio}
              </span>
            </div>
          </div>

          {/* Author & Creator Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-[#DDD6FE]/70 dark:border-[#271E4C] shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src={prompt.author.avatar}
                alt={prompt.author.name}
                className="w-10 h-10 rounded-full object-cover border border-[#DDD6FE] dark:border-[#2E245B]"
              />
              <div>
                <p className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF] flex items-center gap-1">
                  <span>{prompt.author.name}</span>
                  {prompt.author.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#8B5CF6] fill-[#8B5CF6]/20" />
                  )}
                </p>
                <p className="text-[11px] text-[#584F7C] dark:text-[#A59ECA]">{prompt.author.handle}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#584F7C] dark:text-[#A59ECA]">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#8A81AC] dark:text-[#726A99]" />
                {prompt.viewCount.toLocaleString()} views
              </span>
              <button
                onClick={() => setActiveReportPrompt(prompt)}
                className="hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
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
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#201844] hover:bg-[#DDD6FE] dark:hover:bg-[#281E54] text-[#7C3AED] dark:text-[#A78BFA] transition-colors"
              >
                {prompt.category}
              </Link>
              <Link
                href={`/ai/${prompt.aiModel.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E0F2FE] dark:bg-[#0E2838] hover:bg-[#BAE6FD] dark:hover:bg-[#13384F] text-[#0284C7] dark:text-[#38BDF8] transition-colors"
              >
                {prompt.aiModel}
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C143B] dark:text-[#F3F0FF] tracking-tight leading-tight">
              {prompt.title}
            </h1>

            <p className="text-sm text-[#584F7C] dark:text-[#A59ECA] leading-relaxed">
              {prompt.description}
            </p>
          </div>

          {/* Prompt Container: Locked vs Unlocked */}
          {unlocked && promptTextToShow ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B5CF6] dark:text-[#22D3EE] flex items-center gap-1.5">
                  <Unlock className="w-4 h-4" />
                  <span>Prompt Blueprint Unlocked</span>
                </span>
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ready to Copy</span>
                </span>
              </div>

              {/* Code viewer */}
              <PromptViewer prompt={prompt} promptText={promptTextToShow} />
            </div>
          ) : (
            /* Locked Prompt State */
            <div className="rounded-3xl border-2 border-dashed border-[#DDD6FE] dark:border-[#382B6B] bg-white dark:bg-[#150F2E] p-6 sm:p-8 text-center space-y-6 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-500 flex items-center justify-center mx-auto shadow-xs">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1C143B] dark:text-[#F3F0FF]">
                  Complete Prompt is Locked
                </h3>
                <p className="text-xs sm:text-sm text-[#584F7C] dark:text-[#A59ECA] max-w-sm mx-auto leading-relaxed">
                  Watch a short 5-second sponsor advertisement to reveal the complete prompt, stylize weights, negative prompt, and seeds.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-[#8B5CF6]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Watch Ad to Unlock Prompt</span>
                </button>
                <p className="text-[11px] text-[#8A81AC] dark:text-[#726A99]">Takes only 5 seconds · Free access</p>
              </div>
            </div>
          )}

          {/* Tags Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Prompt Keywords & Tags</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#161133] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] text-[#584F7C] dark:text-[#A59ECA] hover:text-[#7C3AED] dark:hover:text-[#22D3EE] border border-[#DDD6FE] dark:border-[#2E245B] transition-colors"
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
        <section className="space-y-6 pt-10 border-t border-[#DDD6FE]/70 dark:border-[#271E4C]/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#1C143B] dark:text-[#F3F0FF]">Similar & Related Prompts</h3>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">Explore more from the {prompt.category} collection.</p>
            </div>
            <Link
              href={`/category/${prompt.category.toLowerCase()}`}
              className="text-xs font-semibold text-[#8B5CF6] dark:text-[#22D3EE] hover:underline"
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
