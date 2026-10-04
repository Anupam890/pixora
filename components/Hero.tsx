"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, Flame } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const trendingTags = [
    { label: "Cinematic 85mm", query: "cinematic" },
    { label: "Haute Couture", query: "fashion" },
    { label: "Nordic Architecture", query: "architecture" },
    { label: "Luxury Product", query: "luxury" },
    { label: "Flux.1 Photoreal", query: "Flux" },
  ];

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E8E8E5] dark:border-[#222222] overflow-hidden bg-gradient-to-b from-[#FAFAF9] via-[#FAFAF9] to-[#F3F3F1]/50 dark:from-[#0C0C0C] dark:via-[#0C0C0C] dark:to-[#121212] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#141414] border border-[#E8E8E5] dark:border-[#262626] shadow-xs text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">
              <Sparkles className="w-3.5 h-3.5 text-[#6D5DFB]" />
              <span>Curated Creative Library for AI Creators</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] dark:text-white leading-[1.08]">
              Discover prompts behind{" "}
              <span className="text-[#6D5DFB] underline decoration-[#6D5DFB]/30 decoration-4 underline-offset-4">
                stunning AI images.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#6B6B6B] dark:text-[#A0A0A0] max-w-xl font-normal leading-relaxed">
              Explore curated AI-generated visuals and unlock the exact prompts and parameters used to create them.
            </p>

            {/* Main Hero Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl pt-2">
              <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-[#141414] border border-[#D5D5D0] dark:border-[#282828] hover:border-[#111111] dark:hover:border-white/30 focus-within:border-[#6D5DFB] focus-within:ring-2 focus-within:ring-[#6D5DFB]/15 transition-all p-1.5">
                <Search className="w-5 h-5 text-[#999999] dark:text-[#666666] ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search image prompts, styles, categories, or models..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-transparent text-[#111111] dark:text-white placeholder-[#999999] dark:placeholder-[#666666] px-3 py-2.5 text-sm sm:text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <span className="text-xs font-medium text-[#999999] dark:text-[#666666]">Try:</span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(tag.query)}`)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-[#161616] hover:bg-[#F3F3F1] dark:hover:bg-[#202020] text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white border border-[#E8E8E5] dark:border-[#262626] transition-colors"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/search"
                className="px-6 py-3 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 font-semibold text-sm tracking-wide shadow-sm hover:shadow transition-all inline-flex items-center gap-2"
              >
                <span>Explore Prompts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/search?sort=trending"
                className="px-6 py-3 rounded-full bg-white dark:bg-[#141414] hover:bg-[#F3F3F1] dark:hover:bg-[#1C1C1C] text-[#111111] dark:text-white font-semibold text-sm tracking-wide border border-[#E8E8E5] dark:border-[#262626] transition-colors inline-flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Trending Now</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="space-y-3">
                <div className="relative h-56 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 group">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Fashion Editorial"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      Midjourney v6.1
                    </span>
                  </div>
                </div>

                <div className="relative h-40 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 group">
                  <Image
                    src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
                    alt="Luxury Fragrance"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      Product · Luxury
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <div className="relative h-40 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 group">
                  <Image
                    src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
                    alt="Cyberpunk Street"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      Flux.1 Schnell
                    </span>
                  </div>
                </div>

                <div className="relative h-56 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 group">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                    alt="Nordic Architecture"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full">
                      Architecture · Minimal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating metric badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 dark:bg-[#141414]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#E8E8E5] dark:border-[#262626] shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6D5DFB]/10 text-[#6D5DFB] flex items-center justify-center font-bold">
                🔒
              </div>
              <div>
                <p className="text-xs text-[#6B6B6B] dark:text-[#999999] font-medium">Verified Unlocks</p>
                <p className="text-sm font-bold text-[#111111] dark:text-white">48,390+ Prompts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
