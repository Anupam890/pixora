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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 border border-pink-500/30 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 dark:from-white dark:via-purple-100 dark:to-pink-300 bg-clip-text text-transparent">
              Saved Favorites
            </h1>
            <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
              {favoritePrompts.length} prompts bookmarked in your personal library.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="masonry-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="masonry-item rounded-2xl bg-white dark:bg-[#150F2E] p-3 space-y-3 border border-purple-200/50 dark:border-[#8B5CF6]/20">
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
        <div className="text-center py-20 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-8 space-y-4 max-w-md mx-auto shadow-xl shadow-purple-950/20">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 border border-pink-500/30 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7 fill-pink-500" />
          </div>
          <h3 className="text-base font-bold text-[#1C143B] dark:text-white">No favorites yet</h3>
          <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
            Tap the heart icon on any prompt card while exploring to keep track of your favorite visuals.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
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
