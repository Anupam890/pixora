"use client";

import React, { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { CategoryBar } from "@/components/CategoryBar";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";
import { PromptItem, AIModelType, SortOptionType } from "@/lib/types";
import {
  Flame,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

const AI_MODELS: (AIModelType | "All")[] = [
  "All",
  "Midjourney",
  "Flux",
  "Stable Diffusion",
  "ChatGPT Image",
  "Ideogram",
];

export default function HomePage() {
  const { userToken } = usePixora();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedModel, setSelectedModel] = useState<AIModelType | "All">("All");
  const [sortBy, setSortBy] = useState<SortOptionType>("trending");
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function loadPrompts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (selectedModel !== "All") params.set("aiModel", selectedModel);
        params.set("sort", sortBy);
        if (userToken) params.set("token", userToken);

        const res = await fetch(`/api/prompts?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setPrompts(data.prompts);
        }
      } catch (err) {
        console.error("Failed to load prompts", err);
      } finally {
        setLoading(false);
      }
    }

    loadPrompts();
  }, [selectedCategory, selectedModel, sortBy, userToken]);

  const handleQuickUnlock = (prompt: PromptItem) => {
    setUnlockTargetPrompt(prompt);
    setIsUnlockModalOpen(true);
  };

  const handleUnlockSuccess = (promptText: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === unlockTargetPrompt?.id ? { ...p, locked: false } : p))
    );
  };

  return (
    <div className="space-y-10">
      {/* Editorial Hero */}
      <Hero />

      {/* Horizontal Category Bar */}
      <CategoryBar
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Main Discovery Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Gallery Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#DDD6FE]/70 dark:border-[#271E4C]/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Trending Prompts</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C143B] dark:text-[#F3F0FF] tracking-tight mt-1">
              The prompts creators are unlocking right now.
            </h2>
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AI Model Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-[#EDE8FB] dark:bg-[#140E2D] p-1 rounded-full border border-[#DDD6FE] dark:border-[#271E4C]">
              {AI_MODELS.slice(0, 4).map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedModel === model
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-xs"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#271E4C] rounded-full px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A81AC] dark:text-[#726A99]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOptionType)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer"
              >
                <option value="trending" className="dark:bg-[#161133]">Trending</option>
                <option value="most-unlocked" className="dark:bg-[#161133]">Most Unlocked</option>
                <option value="most-saved" className="dark:bg-[#161133]">Most Saved</option>
                <option value="newest" className="dark:bg-[#161133]">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="masonry-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="masonry-item rounded-2xl overflow-hidden bg-white dark:bg-[#150F2E] border border-[#DDD6FE]/70 dark:border-[#271E4C] p-3 space-y-3"
              >
                <div
                  className="w-full rounded-xl animate-shimmer"
                  style={{ height: i % 2 === 0 ? "280px" : "360px" }}
                />
                <div className="h-4 w-3/4 rounded-md animate-shimmer" />
                <div className="h-3 w-1/2 rounded-md animate-shimmer" />
              </div>
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <div className="masonry-grid">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onQuickUnlock={handleQuickUnlock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#150F2E] rounded-3xl border border-[#DDD6FE] dark:border-[#271E4C] p-8 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#EDE8FB] dark:bg-[#201844] flex items-center justify-center mx-auto text-[#7C3AED] dark:text-[#A78BFA]">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#1C143B] dark:text-[#F3F0FF]">No prompts found</h3>
            <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
              Try selecting another category, changing the AI model filter, or explore our trending collection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedModel("All");
              }}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/25 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* How Pixora Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="rounded-3xl p-8 sm:p-12 border border-[#8B5CF6]/30 bg-gradient-to-br from-[#160E36] via-[#100B29] to-[#0A0718] text-[#F3F0FF] shadow-2xl shadow-[#8B5CF6]/10 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#06B6D4]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-3 mb-10 z-10 relative">
            <span className="text-xs font-mono uppercase tracking-widest text-[#22D3EE] font-bold">
              THE PIXORA CYCLE
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              From visual inspiration to exact creation.
            </h3>
            <p className="text-sm text-[#A59ECA]">
              Discover stunning AI aesthetics, unlock verified prompting blueprints, and recreate them in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 z-10 relative">
            <div className="p-5 rounded-2xl bg-[#1D1642]/70 backdrop-blur-md border border-[#8B5CF6]/20 hover:border-[#06B6D4]/50 hover:bg-[#231A50] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-sm text-[#22D3EE]">
                01
              </div>
              <h4 className="font-bold text-base text-white">Discover</h4>
              <p className="text-xs text-[#A59ECA] leading-relaxed">
                Browse our curated gallery of photorealistic, editorial, and stylized images.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1D1642]/70 backdrop-blur-md border border-[#8B5CF6]/20 hover:border-[#06B6D4]/50 hover:bg-[#231A50] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-sm text-[#22D3EE]">
                02
              </div>
              <h4 className="font-bold text-base text-white">Preview</h4>
              <p className="text-xs text-[#A59ECA] leading-relaxed">
                Inspect aspect ratios, model version, lighting techniques, and generation tags.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1D1642]/70 backdrop-blur-md border border-[#8B5CF6]/20 hover:border-[#06B6D4]/50 hover:bg-[#231A50] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-sm text-[#22D3EE]">
                03
              </div>
              <h4 className="font-bold text-base text-white">Unlock</h4>
              <p className="text-xs text-[#A59ECA] leading-relaxed">
                Watch a short 5-second sponsor ad to securely decrypt the prompt blueprint.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1D1642]/70 backdrop-blur-md border border-[#8B5CF6]/20 hover:border-[#06B6D4]/50 hover:bg-[#231A50] transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/30 to-[#06B6D4]/30 border border-[#8B5CF6]/40 flex items-center justify-center font-bold text-sm text-[#22D3EE]">
                04
              </div>
              <h4 className="font-bold text-base text-white">Create</h4>
              <p className="text-xs text-[#A59ECA] leading-relaxed">
                Copy with or without parameters directly into Midjourney, Flux, SD, or DALL-E.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Unlock Modal */}
      <AdUnlockModal
        prompt={unlockTargetPrompt}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
      />
    </div>
  );
}
