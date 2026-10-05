"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Filter } from "lucide-react";
import { PromptItem } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";
import { usePixora } from "@/lib/context/PixoraContext";

const CATEGORY_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  fashion: {
    title: "Fashion & Haute Couture Prompts",
    desc: "Vogue-inspired editorial styling, textured fabric draping, chiaroscuro runway lighting, and avant-garde aesthetic blueprints.",
  },
  cinematic: {
    title: "Cinematic Lighting & Film Prompts",
    desc: "Anamorphic lens flares, atmospheric smoke, 35mm Arri Alexa camera grades, and moody neo-noir scenes.",
  },
  product: {
    title: "Commercial Product Photography Prompts",
    desc: "Studio lighting setups, water caustics, luxury perfume bottles, horology macro details, and e-commerce packaging.",
  },
  portrait: {
    title: "AI Portrait & Character Prompts",
    desc: "Hyperrealistic facial features, authentic skin pores, 85mm portrait lenses, and natural emotional expressions.",
  },
  anime: {
    title: "Anime, Manga & Illustration Prompts",
    desc: "Hand-painted cel animation, 90s vintage anime screencaps, Makoto Shinkai sky aesthetics, and Studio Ghibli art.",
  },
  interior: {
    title: "Architecture & Interior Design Prompts",
    desc: "Minimalist Scandinavian villas, Brutalist concrete spaces, warm 2700K ambient lighting, and Architectural Digest layouts.",
  },
  fantasy: {
    title: "Fantasy & Surrealism Prompts",
    desc: "Bioluminescent ecosystems, floating islands, dreamscapes, and mythical concept illustrations.",
  },
  "3d": {
    title: "3D Art & Isometric Diorama Prompts",
    desc: "Matte clay renders, Blender Cycles shaders, tilt-shift miniature models, and clean stylized scenes.",
  },
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug.toLowerCase();
  const meta = CATEGORY_DESCRIPTIONS[slug] || {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Prompts`,
    desc: `Curated AI image prompts and creative parameters for ${slug}.`,
  };

  const { userToken } = usePixora();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function loadCategoryPrompts() {
      setLoading(true);
      try {
        const url = userToken
          ? `/api/prompts?category=${slug}&token=${userToken}`
          : `/api/prompts?category=${slug}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setPrompts(data.prompts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryPrompts();
  }, [slug, userToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Categories</span>
        </Link>

        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-[#150F2E] border border-[#8B5CF6]/30 text-xs font-bold uppercase tracking-wider text-[#8B5CF6] dark:text-[#22D3EE]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Category Collection</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
            {meta.title}
          </h1>
          <p className="text-sm sm:text-base text-[#554D74] dark:text-[#A59ECA] leading-relaxed">
            {meta.desc}
          </p>
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
        <div className="text-center py-16 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-8 space-y-3 max-w-md mx-auto shadow-xl shadow-purple-950/20">
          <Filter className="w-8 h-8 text-[#8B5CF6] dark:text-[#22D3EE] mx-auto opacity-70" />
          <h3 className="font-bold text-sm text-[#1C143B] dark:text-white">No prompts in this category yet</h3>
          <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">Check back shortly or explore our trending collection.</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold rounded-full shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
          >
            Explore Trending
          </Link>
        </div>
      )}

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
