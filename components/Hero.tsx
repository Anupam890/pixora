"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, Flame } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function Hero() {
  const router = useRouter();
  const { setIsSubmitModalOpen } = usePixora();
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
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#DDD6FE]/70 dark:border-[#271E4C]/80 overflow-hidden bg-gradient-to-b from-[#F6F4FE] via-[#EDE8FB] to-[#F6F4FE] dark:from-[#090714] dark:via-[#110D27] dark:to-[#090714] transition-colors">
      {/* Cosmic ambient light glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B5CF6]/20 dark:bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#06B6D4]/15 dark:bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] shadow-sm text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF]">
              <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Curated Creative Library for AI Creators</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1C143B] dark:text-[#F3F0FF] leading-[1.08]">
              Discover prompts behind{" "}
              <span className="bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#06B6D4] bg-clip-text text-transparent">
                stunning AI images.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#584F7C] dark:text-[#A59ECA] max-w-xl font-normal leading-relaxed">
              Explore curated AI-generated visuals and unlock the exact prompts and parameters used to create them.
            </p>

            {/* Main Hero Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl pt-2">
              <div className="relative flex items-center shadow-lg shadow-[#8B5CF6]/5 rounded-2xl bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] hover:border-[#8B5CF6]/50 dark:hover:border-[#8B5CF6]/50 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/25 transition-all p-1.5">
                <Search className="w-5 h-5 text-[#8A81AC] dark:text-[#726A99] ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search image prompts, styles, categories, or models..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-transparent text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] dark:placeholder-[#726A99] px-3 py-2.5 text-sm sm:text-base focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 shadow-md shadow-[#8B5CF6]/25 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <span className="text-xs font-medium text-[#8A81AC] dark:text-[#726A99]">Try:</span>
                {trendingTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => router.push(`/search?q=${encodeURIComponent(tag.query)}`)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#161133] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] text-[#584F7C] dark:text-[#A59ECA] hover:text-[#7C3AED] dark:hover:text-[#22D3EE] border border-[#DDD6FE] dark:border-[#2E245B] transition-colors cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </form>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/search"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-sm tracking-wide shadow-md shadow-[#8B5CF6]/25 hover:shadow-lg hover:shadow-[#8B5CF6]/35 transition-all inline-flex items-center gap-2"
              >
                <span>Explore Prompts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-5 py-3 rounded-full bg-[#EDE9FE] dark:bg-[#1E1642] hover:bg-[#DDD6FE] dark:hover:bg-[#281D58] text-[#7C3AED] dark:text-[#22D3EE] font-semibold text-sm tracking-wide border border-[#DDD6FE] dark:border-[#34246E] transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#8B5CF6] dark:text-[#22D3EE]" />
                <span>Submit a Prompt</span>
              </button>
              <Link
                href="/search?sort=trending"
                className="px-5 py-3 rounded-full bg-white/90 dark:bg-[#161133] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] text-[#1C143B] dark:text-[#F3F0FF] font-semibold text-sm tracking-wide border border-[#DDD6FE] dark:border-[#2E245B] transition-colors inline-flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Trending</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              <div className="space-y-3">
                <div className="relative h-56 rounded-2xl overflow-hidden shadow-md border border-[#8B5CF6]/20 group">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                    alt="Fashion Editorial"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-[#161133]/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                      Midjourney v6.1
                    </span>
                  </div>
                </div>

                <div className="relative h-40 rounded-2xl overflow-hidden shadow-md border border-[#8B5CF6]/20 group">
                  <Image
                    src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80"
                    alt="Luxury Fragrance"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-[#161133]/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                      Product · Luxury
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <div className="relative h-40 rounded-2xl overflow-hidden shadow-md border border-[#8B5CF6]/20 group">
                  <Image
                    src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80"
                    alt="Cyberpunk Street"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-[#161133]/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                      Flux.1 Schnell
                    </span>
                  </div>
                </div>

                <div className="relative h-56 rounded-2xl overflow-hidden shadow-md border border-[#8B5CF6]/20 group">
                  <Image
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                    alt="Nordic Architecture"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090714]/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[11px] font-medium text-white/90 bg-[#161133]/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                      Architecture · Minimal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating metric badge */}
            <div className="absolute -bottom-4 -left-4 bg-white/95 dark:bg-[#161133]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#DDD6FE] dark:border-[#2E245B] shadow-xl shadow-[#8B5CF6]/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#8B5CF6] dark:text-[#22D3EE] flex items-center justify-center font-bold">
                🔒
              </div>
              <div>
                <p className="text-xs text-[#584F7C] dark:text-[#A59ECA] font-medium">Verified Unlocks</p>
                <p className="text-sm font-bold text-[#1C143B] dark:text-[#F3F0FF]">48,390+ Prompts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
