"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Filter,
  RotateCcw,
} from "lucide-react";
import { PromptItem, CategoryType, AIModelType, StyleType, SortOptionType } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";
import { usePixora } from "@/lib/context/PixoraContext";

const CATEGORIES: CategoryType[] = [
  "Portrait",
  "Photography",
  "Fashion",
  "Product",
  "Cinematic",
  "Anime",
  "3D",
  "Fantasy",
  "Interior",
  "Art",
  "Social Media",
  "E-commerce",
];

const AI_MODELS: AIModelType[] = [
  "Midjourney",
  "Flux",
  "Stable Diffusion",
  "ChatGPT Image",
  "Ideogram",
  "Leonardo",
];

const STYLES: StyleType[] = [
  "Photorealistic",
  "Cinematic",
  "Minimal",
  "Editorial",
  "Luxury",
  "Vintage",
  "Anime",
  "3D",
  "Illustration",
  "Surreal",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userToken } = usePixora();

  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialModel = searchParams.get("aiModel") || "All";
  const initialStyle = searchParams.get("style") || "All";
  const initialSort = (searchParams.get("sort") as SortOptionType) || "trending";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedStyle, setSelectedStyle] = useState(initialStyle);
  const [sortBy, setSortBy] = useState<SortOptionType>(initialSort);

  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedModel !== "All") params.set("aiModel", selectedModel);
      if (selectedStyle !== "All") params.set("style", selectedStyle);
      params.set("sort", sortBy);
      if (userToken) params.set("token", userToken);

      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [selectedCategory, selectedModel, selectedStyle, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleResetFilters = () => {
    setQuery("");
    setSelectedCategory("All");
    setSelectedModel("All");
    setSelectedStyle("All");
    setSortBy("trending");
  };

  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedModel !== "All" ? 1 : 0) +
    (selectedStyle !== "All" ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-[#1C143B] dark:text-[#F3F0FF] tracking-tight">
          Explore Prompt Library
        </h1>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <div className="relative flex items-center shadow-lg shadow-[#8B5CF6]/5 rounded-2xl bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/25 p-1.5 transition-all">
            <Search className="w-5 h-5 text-[#8A81AC] dark:text-[#726A99] ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by keywords, aesthetics, camera angles, parameters..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] dark:placeholder-[#726A99] px-3 py-2 text-sm sm:text-base focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 shadow-md shadow-[#8B5CF6]/25 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 bg-white dark:bg-[#150F2E] p-6 rounded-2xl border border-[#DDD6FE]/70 dark:border-[#271E4C] space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD6FE]/70 dark:border-[#271E4C]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#8B5CF6]" />
              <h3 className="font-bold text-sm text-[#1C143B] dark:text-[#F3F0FF]">Filters</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#8B5CF6] dark:text-[#22D3EE] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">Category</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                    : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Filter */}
          <div className="space-y-2 pt-2 border-t border-[#EDE8FB] dark:border-[#271E4C]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">AI Model</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedModel("All")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedModel === "All"
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                    : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                }`}
              >
                All Models
              </button>
              {AI_MODELS.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModel(mod)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedModel === mod
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Style Filter */}
          <div className="space-y-2 pt-2 border-t border-[#EDE8FB] dark:border-[#271E4C]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">Aesthetic Style</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedStyle("All")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedStyle === "All"
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                    : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                }`}
              >
                All Styles
              </button>
              {STYLES.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStyle(st)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedStyle === st
                      ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white font-semibold shadow-xs"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] hover:text-[#1C143B] dark:hover:text-[#F3F0FF]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Results Grid & Controls */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DDD6FE]/70 dark:border-[#271E4C]/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#584F7C] dark:text-[#A59ECA]">
                Found <strong className="text-[#1C143B] dark:text-[#F3F0FF]">{prompts.length}</strong> prompts
              </span>
              {query && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#201844] text-[#7C3AED] dark:text-[#A78BFA] font-semibold">
                  "{query}"
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                className="lg:hidden px-3 py-1.5 rounded-full bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#271E4C] text-xs font-semibold flex items-center gap-1.5 text-[#1C143B] dark:text-[#F3F0FF] cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</span>
              </button>

              <div className="flex items-center gap-1 bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#271E4C] rounded-full px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF]">
                <span className="text-[#8A81AC] dark:text-[#726A99] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOptionType)}
                  className="bg-transparent font-semibold text-[#1C143B] dark:text-[#F3F0FF] focus:outline-none cursor-pointer"
                >
                  <option value="trending" className="dark:bg-[#161133]">Trending</option>
                  <option value="most-unlocked" className="dark:bg-[#161133]">Most Unlocked</option>
                  <option value="most-saved" className="dark:bg-[#161133]">Most Saved</option>
                  <option value="newest" className="dark:bg-[#161133]">Newest</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="masonry-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="masonry-item rounded-2xl bg-white dark:bg-[#150F2E] border border-[#DDD6FE]/70 dark:border-[#271E4C] p-3 space-y-3"
                >
                  <div className="w-full h-64 rounded-xl animate-shimmer" />
                  <div className="h-4 w-3/4 rounded-md animate-shimmer" />
                </div>
              ))}
            </div>
          ) : prompts.length > 0 ? (
            <div className="masonry-grid">
              {prompts.map((p) => (
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
            <div className="text-center py-16 bg-white dark:bg-[#150F2E] rounded-3xl border border-[#DDD6FE] dark:border-[#271E4C] p-8 space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] dark:bg-[#201844] flex items-center justify-center mx-auto text-[#7C3AED] dark:text-[#A78BFA]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#1C143B] dark:text-[#F3F0FF]">No matching prompts found</h3>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
                Try adjusting your search keywords, clear active category filters, or explore our trending collection.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/25 transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ad Unlock Modal */}
      <AdUnlockModal
        prompt={unlockTargetPrompt}
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlockSuccess={() => {
          setPrompts((prev) =>
            prev.map((p) => (p.id === unlockTargetPrompt?.id ? { ...p, locked: false } : p))
          );
        }}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
