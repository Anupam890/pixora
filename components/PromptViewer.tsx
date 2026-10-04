"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Bookmark,
  Share2,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { PromptItem } from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";

interface PromptViewerProps {
  prompt: PromptItem;
  promptText: string;
}

export function PromptViewer({ prompt, promptText }: PromptViewerProps) {
  const { addToast, setActiveSharePrompt, collections, addToCollection } = usePixora();
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);

  const getCleanPromptText = (rawText: string) => {
    return rawText.replace(/--[a-z0-9_-]+\s+[^\s-]+/gi, "").replace(/--[a-z0-9_-]+/gi, "").trim();
  };

  const handleCopyFull = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedFull(true);
      addToast("Copied to clipboard!", "Prompt text & parameters copied.");
      setTimeout(() => setCopiedFull(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyClean = async () => {
    try {
      const clean = getCleanPromptText(promptText);
      await navigator.clipboard.writeText(clean);
      setCopiedClean(true);
      addToast("Copied clean prompt!", "Parameters omitted for cross-model compatibility.");
      setTimeout(() => setCopiedClean(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyNegative = async () => {
    if (!prompt.parameters?.negativePrompt) return;
    try {
      await navigator.clipboard.writeText(prompt.parameters.negativePrompt);
      setCopiedNegative(true);
      addToast("Copied negative prompt!");
      setTimeout(() => setCopiedNegative(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Code / Terminal Container */}
      <div className="rounded-2xl overflow-hidden border border-[#222222] bg-[#111111] text-white shadow-xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#181818] border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-xs text-[#999999] tracking-wider uppercase">
              {prompt.aiModel} · PROMPT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              {copiedFull ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#999999]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="p-6 font-mono text-sm sm:text-base leading-relaxed text-gray-100 selection:bg-[#6D5DFB] selection:text-white overflow-x-auto whitespace-pre-wrap">
          {promptText}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-6 py-4 bg-[#141414] border-t border-[#222222] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyFull}
              className="px-4 py-2 rounded-xl bg-white text-[#111111] hover:bg-gray-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Prompt</span>
            </button>

            <button
              onClick={handleCopyClean}
              className="px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2E2E2E] text-white/90 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{copiedClean ? "Copied Clean" : "Copy Without Parameters"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                className="px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2E2E2E] text-white/90 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
                <ChevronDown className="w-3 h-3 text-[#999999]" />
              </button>

              {showCollectionDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl bg-[#1C1C1C] border border-[#2A2A2A] shadow-2xl p-2 z-30 animate-in fade-in-0">
                  <p className="text-[11px] font-semibold text-[#888888] px-2.5 py-1 uppercase tracking-wider">
                    Add to Collection
                  </p>
                  <div className="space-y-1">
                    {collections.map((col) => {
                      const contains = col.promptIds.includes(prompt.id);
                      return (
                        <button
                          key={col.id}
                          onClick={() => {
                            addToCollection(col.id, prompt.id);
                            setShowCollectionDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            contains
                              ? "bg-white/10 text-emerald-400"
                              : "text-white/80 hover:bg-white/5"
                          }`}
                        >
                          <span className="truncate">{col.name}</span>
                          {contains && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveSharePrompt(prompt)}
              className="p-2 rounded-xl bg-[#222222] hover:bg-[#2E2E2E] text-white/90 font-medium text-xs transition-colors cursor-pointer"
              title="Share Prompt"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Parameters Breakdown Card */}
      {prompt.parameters && (
        <div className="bg-white dark:bg-[#141414] rounded-2xl p-5 border border-[#E8E8E5] dark:border-[#222222] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B] dark:text-[#888888] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#6D5DFB]" />
              <span>Generation Parameters</span>
            </h4>
            <span className="text-[11px] font-semibold bg-[#F3F3F1] dark:bg-[#1E1E1E] text-[#111111] dark:text-white px-2.5 py-0.5 rounded-full">
              {prompt.aiModel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
              <span className="text-[#999999] dark:text-[#777777] block text-[11px]">Aspect Ratio</span>
              <span className="font-semibold text-[#111111] dark:text-white">{prompt.aspectRatio}</span>
            </div>

            {prompt.parameters.version && (
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
                <span className="text-[#999999] dark:text-[#777777] block text-[11px]">Model Version</span>
                <span className="font-semibold text-[#111111] dark:text-white">{prompt.parameters.version}</span>
              </div>
            )}

            {prompt.parameters.seed && (
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
                <span className="text-[#999999] dark:text-[#777777] block text-[11px]">Seed</span>
                <span className="font-mono font-semibold text-[#111111] dark:text-white">{prompt.parameters.seed}</span>
              </div>
            )}

            {prompt.parameters.stylize !== undefined && (
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
                <span className="text-[#999999] dark:text-[#777777] block text-[11px]">Stylize (--s)</span>
                <span className="font-semibold text-[#111111] dark:text-white">{prompt.parameters.stylize}</span>
              </div>
            )}

            {prompt.parameters.cfgScale !== undefined && (
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
                <span className="text-[#999999] dark:text-[#777777] block text-[11px]">CFG Scale</span>
                <span className="font-semibold text-[#111111] dark:text-white">{prompt.parameters.cfgScale}</span>
              </div>
            )}

            {prompt.parameters.sampler && (
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#262626]">
                <span className="text-[#999999] dark:text-[#777777] block text-[11px]">Sampler</span>
                <span className="font-semibold text-[#111111] dark:text-white">{prompt.parameters.sampler}</span>
              </div>
            )}
          </div>

          {prompt.parameters.negativePrompt && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#6B6B6B] dark:text-[#888888]">Negative Prompt:</span>
                <button
                  onClick={handleCopyNegative}
                  className="text-[11px] text-[#6D5DFB] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedNegative ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNegative ? "Copied" : "Copy Negative"}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#FAFAF9] dark:bg-[#1A1A1A] border border-[#E8E8E5] dark:border-[#262626] font-mono text-xs text-[#6B6B6B] dark:text-[#999999]">
                {prompt.parameters.negativePrompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
