"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  Unlock,
  Layers,
  Settings,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";
import { PromptItem } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";

export default function ProfilePage() {
  const {
    unlockedPromptIds,
    favorites,
    collections,
    isProUser,
    toggleProUser,
    setIsProModalOpen,
    userToken,
  } = usePixora();

  const [activeTab, setActiveTab] = useState<"unlocks" | "favorites" | "collections" | "settings">("unlocks");
  const [unlockedPrompts, setUnlockedPrompts] = useState<PromptItem[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function fetchUserPrompts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts?token=${userToken}`);
        const data = await res.json();
        if (data.success) {
          const all: PromptItem[] = data.prompts;
          setUnlockedPrompts(all.filter((p) => unlockedPromptIds.has(p.id)));
          setFavoritePrompts(all.filter((p) => favorites.has(p.id)));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPrompts();
  }, [unlockedPromptIds, favorites, userToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">
                Creator Studio
              </h1>
              {isProUser && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  PRO
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6B6B] font-mono">
              Session ID: {userToken || "guest_session"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsProModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#111111] text-white hover:bg-[#2A2A2A] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isProUser ? "Manage Pro" : "Upgrade to Pro"}</span>
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8E5] pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("unlocks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "unlocks"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          <Unlock className="w-4 h-4" />
          <span>Unlocked History ({unlockedPromptIds.size})</span>
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "favorites"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favorites ({favorites.size})</span>
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "collections"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Collections ({collections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
            activeTab === "settings"
              ? "bg-[#111111] text-white"
              : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F3F3F1]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab 1: Unlocks History */}
      {activeTab === "unlocks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111111]">Prompts You Have Unlocked</h3>
            <span className="text-xs text-[#6B6B6B]">Always available without re-watching ads</span>
          </div>

          {unlockedPrompts.length > 0 ? (
            <div className="masonry-grid">
              {unlockedPrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E8E5] p-8 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#F3F3F1] flex items-center justify-center mx-auto text-[#6B6B6B]">
                <Unlock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#111111]">No unlocked prompts yet</h4>
              <p className="text-xs text-[#6B6B6B]">
                When you unlock prompts by watching a 5-sec ad, they appear here permanently.
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold"
              >
                Explore Prompts to Unlock
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#111111]">Saved Favorites</h3>
            <span className="text-xs text-[#6B6B6B]">Your bookmarked inspiration</span>
          </div>

          {favoritePrompts.length > 0 ? (
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
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E8E5] p-8 space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#111111]">No favorites saved yet</h4>
              <p className="text-xs text-[#6B6B6B]">
                Tap the heart icon on any prompt card while browsing to save it here.
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold"
              >
                Browse Gallery
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Collections */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Your Custom Collections</h3>
              <p className="text-xs text-[#6B6B6B]">Organize prompts by project, client, or visual style.</p>
            </div>
            <Link
              href="/collections"
              className="text-xs font-semibold text-[#6D5DFB] hover:underline"
            >
              Open Collections Manager →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-5 rounded-2xl bg-white border border-[#E8E8E5] space-y-3 hover:border-[#111111] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">{col.name}</span>
                  <span className="text-[11px] text-[#999999]">{col.promptIds.length} items</span>
                </div>
                <p className="text-xs text-[#6B6B6B]">{col.description || "Custom curated prompts."}</p>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#6D5DFB] hover:underline pt-2"
                >
                  <span>View Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Preferences */}
      {activeTab === "settings" && (
        <div className="max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E8E5] space-y-6">
          <h3 className="text-lg font-bold text-[#111111]">Account & Plan Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAFAF9] border border-[#E8E8E5]">
              <div>
                <h4 className="text-xs font-bold text-[#111111]">Pixora Pro Plan</h4>
                <p className="text-[11px] text-[#6B6B6B]">
                  {isProUser ? "Active — Enjoy ad-free instant unlocks" : "Free Plan — Ad-supported access"}
                </p>
              </div>
              <button
                onClick={toggleProUser}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-[#2A2A2A] transition-colors"
              >
                {isProUser ? "Switch to Free" : "Upgrade to Pro"}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E8E8E5] space-y-2">
              <h4 className="text-xs font-bold text-[#111111]">Session Persistence</h4>
              <p className="text-xs text-[#6B6B6B]">
                Your unlocks and saved prompts are stored locally in this browser. To sync across devices, Supabase Auth connects instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      <AdUnlockModal
        prompt={unlockTargetPrompt}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={() => {}}
      />
    </div>
  );
}
