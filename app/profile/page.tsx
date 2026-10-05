"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Heart,
  Layers,
  Settings,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";
import { PromptItem, CommunitySubmission } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";

export default function ProfilePage() {
  const {
    favorites,
    collections,
    isProUser,
    setIsProModalOpen,
    setIsSubmitModalOpen,
    userToken,
  } = usePixora();

  const [activeTab, setActiveTab] = useState<"favorites" | "collections" | "submissions" | "settings">("favorites");
  const [favoritePrompts, setFavoritePrompts] = useState<PromptItem[]>([]);
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserPrompts() {
      setLoading(true);
      try {
        const [promptsRes, subsRes] = await Promise.all([
          fetch(`/api/prompts?token=${userToken}`),
          fetch(`/api/submissions`),
        ]);

        const promptsData = await promptsRes.json();
        if (promptsData.success) {
          const all: PromptItem[] = promptsData.prompts;
          setFavoritePrompts(all.filter((p) => favorites.has(p.id)));
        }

        const subsData = await subsRes.json();
        if (subsData.success) {
          setSubmissions(subsData.submissions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchUserPrompts();
  }, [favorites, userToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="bg-white dark:bg-[#150F2E] rounded-3xl p-6 sm:p-8 border border-purple-200/50 dark:border-[#8B5CF6]/30 shadow-xl shadow-purple-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-500/30">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
                Creator Studio
              </h1>
              {isProUser && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
                  PRO
                </span>
              )}
            </div>
            <p className="text-xs text-[#554D74] dark:text-[#A59ECA] font-mono">
              Session ID: {userToken || "guest_session"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Prompt</span>
          </button>

          <button
            onClick={() => setIsProModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-white dark:bg-[#1E1744] border border-[#DDD6FE] dark:border-[#382670] text-xs font-semibold text-[#1C143B] dark:text-white flex items-center gap-2 hover:bg-[#EDE9FE] dark:hover:bg-[#251A55] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isProUser ? "Manage Pro" : "Upgrade Pro"}</span>
          </button>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-purple-200/50 dark:border-[#8B5CF6]/20 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "favorites"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favorites ({favorites.size})</span>
        </button>

        <button
          onClick={() => setActiveTab("collections")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "collections"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>My Collections ({collections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "submissions"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Community Submissions ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
            activeTab === "settings"
              ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
              : "text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white hover:bg-purple-50 dark:hover:bg-[#150F2E]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab 1: Saved Favorites */}
      {activeTab === "favorites" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1C143B] dark:text-white">Saved Inspiration</h3>
            <span className="text-xs text-[#554D74] dark:text-[#A59ECA]">
              {favoritePrompts.length} bookmarked {favoritePrompts.length === 1 ? "prompt" : "prompts"}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl animate-shimmer" />
              ))}
            </div>
          ) : favoritePrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePrompts.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-8 space-y-4 max-w-md mx-auto shadow-xl shadow-purple-950/20">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 dark:bg-pink-500/20 text-pink-500 border border-pink-500/30 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 fill-pink-500" />
              </div>
              <h4 className="font-bold text-sm text-[#1C143B] dark:text-white">No favorites saved yet</h4>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Tap the heart bookmark on any prompt visual to save it for your creative workflow.
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all"
              >
                Explore Prompts
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Collections */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#1C143B] dark:text-white">Creative Moodboards</h3>
            <Link
              href="/collections"
              className="text-xs font-semibold text-[#8B5CF6] dark:text-[#22D3EE] hover:underline"
            >
              Open Collections Studio →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-[#150F2E] rounded-3xl p-6 border border-purple-200/50 dark:border-[#8B5CF6]/30 shadow-lg shadow-purple-950/15 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-[#0F0C20] flex items-center justify-center text-[#8B5CF6] dark:text-[#22D3EE]">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#554D74] dark:text-[#A59ECA]">
                    {c.promptIds.length} {c.promptIds.length === 1 ? "prompt" : "prompts"}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#1C143B] dark:text-white">{c.name}</h4>
                  {c.description && (
                    <p className="text-xs text-[#554D74] dark:text-[#A59ECA] line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </div>

                <Link
                  href="/collections"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6] dark:text-[#22D3EE] hover:underline pt-2"
                >
                  <span>View Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Submissions */}
      {activeTab === "submissions" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#1C143B] dark:text-white">Community Submissions</h3>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
                Track the moderation status of prompt blueprints you have submitted.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-500/25 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Another</span>
            </button>
          </div>

          {submissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/30 shadow-md"
                >
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-purple-50 dark:bg-[#0F0C20] shrink-0 border border-[#DDD6FE] dark:border-[#2E245B]">
                    <Image src={sub.imageUrl} alt={sub.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#1C143B] dark:text-white line-clamp-1">
                        {sub.title}
                      </h4>

                      {sub.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : sub.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30 shrink-0">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>In Review</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-[#554D74] dark:text-[#A59ECA] line-clamp-2">
                      {sub.promptText}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#8A81AC] dark:text-[#726A99] pt-1">
                      <span>{sub.aiModel} · {sub.category}</span>
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-8 space-y-4 max-w-md mx-auto shadow-xl shadow-purple-950/20">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-[#0F0C20] flex items-center justify-center mx-auto text-[#8B5CF6] dark:text-[#22D3EE]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1C143B] dark:text-white">No submissions yet</h4>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Have you generated a stunning image with Midjourney, Flux, or Stable Diffusion? Submit your prompt to get featured!
              </p>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
              >
                Submit Your First Prompt
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Preferences */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white dark:bg-[#150F2E] rounded-3xl p-6 sm:p-8 border border-purple-200/50 dark:border-[#8B5CF6]/30 shadow-xl shadow-purple-950/20 space-y-6">
          <h3 className="text-base font-bold text-[#1C143B] dark:text-white">Account & Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/30 dark:border-[#8B5CF6]/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1C143B] dark:text-white">Pixora Pro Membership</p>
                <p className="text-[11px] text-[#554D74] dark:text-[#A59ECA]">
                  {isProUser ? "Pro active with zero-ad instant prompt unlocks." : "Ad-supported free access mode."}
                </p>
              </div>
              <button
                onClick={() => setIsProModalOpen(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-xs cursor-pointer"
              >
                {isProUser ? "Manage" : "Upgrade"}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 dark:bg-[#0F0C20] border border-purple-200/30 dark:border-[#8B5CF6]/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1C143B] dark:text-white">Session Identifier</p>
                <p className="text-[11px] text-[#554D74] dark:text-[#A59ECA] font-mono break-all">
                  {userToken}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
