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
      <div className="rounded-2xl overflow-hidden border border-[#8B5CF6]/30 bg-gradient-to-b from-[#181138] to-[#100B29] text-[#F3F0FF] shadow-2xl shadow-[#8B5CF6]/15">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1F1748] border-b border-[#2D2260]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 font-mono text-xs text-[#A59ECA] tracking-wider uppercase font-semibold">
              {prompt.aiModel} · PROMPT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/35 border border-[#8B5CF6]/30 text-xs font-medium text-[#F3F0FF] transition-colors cursor-pointer"
            >
              {copiedFull ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#22D3EE]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="p-6 font-mono text-sm sm:text-base leading-relaxed text-[#F3F0FF] selection:bg-[#8B5CF6] selection:text-white overflow-x-auto whitespace-pre-wrap">
          {promptText}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-6 py-4 bg-[#140E2D] border-t border-[#2D2260] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyFull}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-[#8B5CF6]/25 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Full Prompt</span>
            </button>

            <button
              onClick={handleCopyClean}
              className="px-3.5 py-2 rounded-xl bg-[#231A4D] hover:bg-[#2C2161] text-[#E0E7FF] border border-[#8B5CF6]/20 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{copiedClean ? "Copied Clean" : "Copy Without Parameters"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
                className="px-3.5 py-2 rounded-xl bg-[#231A4D] hover:bg-[#2C2161] text-[#E0E7FF] border border-[#8B5CF6]/20 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Save</span>
                <ChevronDown className="w-3 h-3 text-[#A59ECA]" />
              </button>

              {showCollectionDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl bg-[#1B133E] border border-[#3E2E72] shadow-2xl p-2 z-30 animate-in fade-in-0">
                  <p className="text-[11px] font-semibold text-[#A59ECA] px-2.5 py-1 uppercase tracking-wider">
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
                              ? "bg-[#8B5CF6]/20 text-[#22D3EE] font-semibold"
                              : "text-[#E0E7FF] hover:bg-[#271E54]"
                          }`}
                        >
                          <span className="truncate">{col.name}</span>
                          {contains && <Check className="w-3.5 h-3.5 text-[#22D3EE]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveSharePrompt(prompt)}
              className="p-2 rounded-xl bg-[#231A4D] hover:bg-[#2C2161] text-[#E0E7FF] border border-[#8B5CF6]/20 font-medium text-xs transition-colors cursor-pointer"
              title="Share Prompt"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Parameters Breakdown Card */}
      {prompt.parameters && (
        <div className="bg-white dark:bg-[#150F2E] rounded-2xl p-5 border border-[#DDD6FE]/70 dark:border-[#271E4C] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Generation Parameters</span>
            </h4>
            <span className="text-[11px] font-semibold bg-[#EDE9FE] dark:bg-[#201844] text-[#7C3AED] dark:text-[#A78BFA] px-2.5 py-0.5 rounded-full border border-[#DDD6FE] dark:border-[#33256B]">
              {prompt.aiModel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
              <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">Aspect Ratio</span>
              <span className="font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.aspectRatio}</span>
            </div>

            {prompt.parameters.version && (
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
                <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">Model Version</span>
                <span className="font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.parameters.version}</span>
              </div>
            )}

            {prompt.parameters.seed && (
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
                <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">Seed</span>
                <span className="font-mono font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.parameters.seed}</span>
              </div>
            )}

            {prompt.parameters.stylize !== undefined && (
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
                <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">Stylize (--s)</span>
                <span className="font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.parameters.stylize}</span>
              </div>
            )}

            {prompt.parameters.cfgScale !== undefined && (
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
                <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">CFG Scale</span>
                <span className="font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.parameters.cfgScale}</span>
              </div>
            )}

            {prompt.parameters.sampler && (
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B]">
                <span className="text-[#8A81AC] dark:text-[#726A99] block text-[11px]">Sampler</span>
                <span className="font-semibold text-[#1C143B] dark:text-[#F3F0FF]">{prompt.parameters.sampler}</span>
              </div>
            )}
          </div>

          {prompt.parameters.negativePrompt && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#584F7C] dark:text-[#A59ECA]">Negative Prompt:</span>
                <button
                  onClick={handleCopyNegative}
                  className="text-[11px] text-[#8B5CF6] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedNegative ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNegative ? "Copied" : "Copy Negative"}</span>
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B] font-mono text-xs text-[#584F7C] dark:text-[#A59ECA]">
                {prompt.parameters.negativePrompt}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
