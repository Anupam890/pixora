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
    <div className="masonry-item group relative bg-white dark:bg-[#150F2E] rounded-2xl overflow-hidden border border-[#DDD6FE]/70 dark:border-[#271E4C] hover:border-[#8B5CF6]/50 dark:hover:border-[#8B5CF6]/60 shadow-sm hover:shadow-xl hover:shadow-[#8B5CF6]/10 transition-all duration-300">
      <Link href={`/prompt/${prompt.slug}`} className="block relative">
        {/* Image Container */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-[#ECE8FB] dark:bg-[#120D26]`}>
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
            <span className="text-[11px] font-semibold tracking-wide px-2.5 py-1 rounded-full bg-[#090714]/75 backdrop-blur-md text-[#F3F0FF] border border-white/10 shadow-xs">
              {prompt.category}
            </span>
            <span className="text-[11px] font-medium tracking-wide px-2 py-1 rounded-full bg-white/90 dark:bg-[#161133]/90 backdrop-blur-md text-[#1C143B] dark:text-[#F3F0FF] border border-[#DDD6FE]/50 dark:border-white/10 shadow-xs">
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
                  ? "bg-red-50 dark:bg-red-950/80 text-red-500 hover:bg-red-100"
                  : "bg-white/90 dark:bg-[#161133]/90 hover:bg-white dark:hover:bg-[#1F1746] text-[#1C143B] dark:text-[#F3F0FF]"
              }`}
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="p-2 rounded-full bg-white/90 dark:bg-[#161133]/90 hover:bg-white dark:hover:bg-[#1F1746] text-[#1C143B] dark:text-[#F3F0FF] backdrop-blur-md transition-transform duration-150 active:scale-90 shadow-sm"
              title="Share Prompt"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Overlay Gradient on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-[#090714]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

          {/* View Action Button on Hover */}
          <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <div className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-[#8B5CF6]/30 transition-all">
              <span>View Prompt & Blueprint</span>
            </div>
          </div>
        </div>

        {/* Card Details Body */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-[15px] sm:text-base text-[#1C143B] dark:text-[#F3F0FF] leading-snug line-clamp-1 group-hover:text-[#8B5CF6] dark:group-hover:text-[#22D3EE] transition-colors">
            {prompt.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-[#584F7C] dark:text-[#A59ECA]">
            <div className="flex items-center gap-1.5">
              <span>{prompt.category}</span>
              <span>·</span>
              <span>{prompt.aiModel}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-[#8A81AC] dark:text-[#726A99]" />
                {prompt.viewCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Clean Author & Ratio Bar */}
          <div className="pt-2 border-t border-[#EDE8FB] dark:border-[#201844] flex items-center justify-between text-[11px] text-[#584F7C] dark:text-[#A59ECA]">
            <span className="font-medium truncate max-w-[150px]">
              by {prompt.author.name}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#EDE9FE]/60 dark:bg-[#1E1744] text-[#7C3AED] dark:text-[#A78BFA] font-medium text-[10px]">
              {prompt.aspectRatio}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
