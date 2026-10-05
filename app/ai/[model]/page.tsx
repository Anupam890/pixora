"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Sliders } from "lucide-react";
import { PromptItem } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";
import { AdUnlockModal } from "@/components/AdUnlockModal";
import { usePixora } from "@/lib/context/PixoraContext";

const MODEL_DATA: Record<string, { title: string; subtitle: string; tip: string }> = {
  midjourney: {
    title: "Midjourney Prompts & Parameters",
    subtitle: "Explore high-impact prompts calibrated for Midjourney v6 and Niji 6.",
    tip: "Tip: Midjourney v6 responds best to direct natural language descriptions with `--stylize` (0–1000) and `--style raw`.",
  },
  flux: {
    title: "Flux.1 AI Prompts",
    subtitle: "Frontier open-weights diffusion prompts engineered for photorealism and typographic clarity.",
    tip: "Tip: Flux excels at complex spatial relationships, hands, and rendering legible textual signs inside scenes.",
  },
  "stable-diffusion": {
    title: "Stable Diffusion XL Prompts",
    subtitle: "Fine-tuned checkpoint prompts with negative prompts and custom samplers.",
    tip: "Tip: SDXL yields best results with DPM++ 2M Karras sampler, 30–40 steps, and descriptive negative prompts.",
  },
  "chatgpt-image": {
    title: "ChatGPT & DALL-E 3 Prompts",
    subtitle: "Natural language conversational prompts designed for OpenAI DALL-E 3.",
    tip: "Tip: DALL-E 3 follows intricate narrative details and excels at complex surrealist concepts without technical flags.",
  },
  ideogram: {
    title: "Ideogram 2.0 Prompts",
    subtitle: "Prompts tuned for 3D clay, graphic design, and in-image typography.",
    tip: "Tip: Ideogram 2.0 is the leader in rendering typography on posters, t-shirts, and 3D miniature dioramas.",
  },
};

export default function AIModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const resolvedParams = use(params);
  const rawModel = resolvedParams.model.toLowerCase();
  const info = MODEL_DATA[rawModel] || {
    title: `${rawModel.toUpperCase()} Prompts`,
    subtitle: `Curated prompts generated with ${rawModel}.`,
    tip: "Curated AI prompts tested for optimal generation quality.",
  };

  const { userToken } = usePixora();
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockTargetPrompt, setUnlockTargetPrompt] = useState<PromptItem | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function loadModelPrompts() {
      setLoading(true);
      try {
        const queryModel =
          rawModel === "midjourney"
            ? "Midjourney"
            : rawModel === "flux"
            ? "Flux"
            : rawModel === "stable-diffusion"
            ? "Stable Diffusion"
            : rawModel === "chatgpt-image"
            ? "ChatGPT Image"
            : rawModel === "ideogram"
            ? "Ideogram"
            : rawModel;

        const url = userToken
          ? `/api/prompts?aiModel=${encodeURIComponent(queryModel)}&token=${userToken}`
          : `/api/prompts?aiModel=${encodeURIComponent(queryModel)}`;

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

    loadModelPrompts();
  }, [rawModel, userToken]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>

        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-[#150F2E] border border-[#8B5CF6]/30 text-xs font-bold uppercase tracking-wider text-[#8B5CF6] dark:text-[#22D3EE]">
            <Cpu className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>AI Model Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
            {info.title}
          </h1>
          <p className="text-base text-[#554D74] dark:text-[#A59ECA] leading-relaxed">
            {info.subtitle}
          </p>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#150F2E] border border-purple-200/50 dark:border-[#8B5CF6]/30 text-xs text-[#1C143B] dark:text-[#F3F0FF] font-medium flex items-start gap-3 shadow-md shadow-purple-950/10">
            <Sliders className="w-4 h-4 text-[#8B5CF6] dark:text-[#22D3EE] shrink-0 mt-0.5" />
            <span>{info.tip}</span>
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
          <h3 className="font-bold text-sm text-[#1C143B] dark:text-white">No prompts matching this model yet</h3>
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
