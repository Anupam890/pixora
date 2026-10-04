"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";
import { PromptItem } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";

export default function FavoritesPage() {
  const { favorites, userToken } = usePixora();
  const [favoritePrompts, setFavoritePrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts?token=${userToken}`);
        const data = await res.json();
        if (data.success) {
          setFavoritePrompts(
            data.prompts.filter((p: PromptItem) => favorites.has(p.id))
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [favorites, userToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Saved Favorites
            </h1>
            <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">
              {favoritePrompts.length} prompts bookmarked in your personal library.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="masonry-item rounded-2xl bg-white dark:bg-[#141414] p-3 space-y-3 border border-[#E8E8E5] dark:border-[#222222]">
              <div className="w-full h-64 rounded-xl animate-shimmer" />
            </div>
          ))}
        </div>
      ) : favoritePrompts.length > 0 ? (
        <div className="masonry-grid">
          {favoritePrompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onQuickUnlock={(target) => {
                setUnlockTargetPrompt(target);
                setIsUnlockModalOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#141414] rounded-3xl border border-[#E8E8E5] dark:border-[#222222] p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#111111] dark:text-white">No favorites yet</h3>
          <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">
            Tap the heart icon on any prompt card while exploring to keep track of your favorite visuals.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-semibold hover:bg-[#2A2A2A] dark:hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Explore Prompts
          </Link>
        </div>
      )}

      <AdUnlockModal
        prompt={unlockTargetPrompt}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={() => {
          setFavoritePrompts((prev) =>
            prev.map((p) => (p.id === unlockTargetPrompt?.id ? { ...p, locked: false } : p))
          );
        }}
      />
    </div>
  );
}
