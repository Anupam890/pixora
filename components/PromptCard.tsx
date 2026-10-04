"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, Unlock, Heart, Share2, Eye } from "lucide-react";
import { PromptItem } from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";

interface PromptCardProps {
  prompt: PromptItem;
  onQuickUnlock?: (prompt: PromptItem) => void;
}

export function PromptCard({ prompt, onQuickUnlock }: PromptCardProps) {
  const { isUnlocked, isFavorite, toggleFavorite, setActiveSharePrompt } = usePixora();
  const [imageLoaded, setImageLoaded] = useState(false);
  const unlocked = isUnlocked(prompt.id);
  const favorite = isFavorite(prompt.id);

  const aspectClass =
    prompt.aspectRatio === "16:9"
      ? "aspect-video"
      : prompt.aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : prompt.aspectRatio === "4:5"
      ? "aspect-[4/5]"
      : prompt.aspectRatio === "3:2"
      ? "aspect-[3/2]"
      : prompt.aspectRatio === "2:3"
      ? "aspect-[2/3]"
      : "aspect-square";

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(prompt.id, prompt.slug);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSharePrompt(prompt);
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    if (!unlocked && onQuickUnlock) {
      e.preventDefault();
      e.stopPropagation();
      onQuickUnlock(prompt);
    }
  };

  return (
    <div className="masonry-item group relative bg-white dark:bg-[#141414] rounded-2xl overflow-hidden border border-[#E8E8E5] dark:border-[#222222] hover:border-[#D5D5D0] dark:hover:border-[#383838] shadow-xs hover:shadow-md transition-all duration-200">
      <Link href={`/prompt/${prompt.slug}`} className="block relative">
        {/* Image Container */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#F3F3F1] dark:bg-[#1C1C1C]`}>
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer" />
          )}

          <Image
            src={prompt.imageUrl}
            alt={prompt.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Top Pill Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-xs">
              {prompt.category}
            </span>
            <span className="text-[11px] font-medium tracking-wide px-2 py-1 rounded-full bg-white/85 dark:bg-black/75 backdrop-blur-md text-[#111111] dark:text-white shadow-xs">
              {prompt.aiModel}
            </span>
          </div>

          {/* Hover Overlay Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={handleFavoriteClick}
              className={`p-2 rounded-full backdrop-blur-md transition-transform duration-150 active:scale-90 shadow-sm ${
                favorite
                  ? "bg-red-50 dark:bg-red-950/80 text-red-600 hover:bg-red-100"
                  : "bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white"
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 rounded-full bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black text-[#111111] dark:text-white backdrop-blur-md transition-transform duration-150 active:scale-90 shadow-sm"
              title="Share Prompt"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

          {/* Fast Unlock Action Button on Hover */}
          <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {unlocked ? (
              <div className="w-full py-2 px-3 rounded-xl bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md text-[#111111] dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm">
                <Unlock className="w-3.5 h-3.5 text-[#6D5DFB]" />
                <span>Unlocked · View Prompt</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleUnlockClick}
                className="w-full py-2 px-3 rounded-xl bg-[#111111] dark:bg-white hover:bg-[#2A2A2A] dark:hover:bg-gray-100 text-white dark:text-[#111111] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                <span>Unlock Prompt (5s Ad)</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Details Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-[15px] sm:text-base text-[#111111] dark:text-[#EDEDED] leading-snug line-clamp-1 group-hover:text-[#6D5DFB] transition-colors">
            {prompt.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-[#6B6B6B] dark:text-[#999999]">
            <div className="flex items-center gap-1.5">
              <span>{prompt.category}</span>
              <span>·</span>
              <span>{prompt.aiModel}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#999999] dark:text-[#777777]" />
                {prompt.viewCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Persistent Lock / Unlock Status Bar */}
          <div className="pt-2 border-t border-[#F3F3F1] dark:border-[#1E1E1E] flex items-center justify-between">
            {unlocked ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D5DFB]">
                <Unlock className="w-3.5 h-3.5" />
                <span>Prompt Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6B6B6B] dark:text-[#999999] group-hover:text-[#111111] dark:group-hover:text-white">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Unlock Prompt</span>
              </span>
            )}

            <span className="text-[11px] font-medium text-[#999999] dark:text-[#666666]">
              {prompt.unlockCount.toLocaleString()} unlocks
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
