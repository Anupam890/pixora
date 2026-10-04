"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function ShareModal() {
  const { activeSharePrompt, setActiveSharePrompt, addToast } = usePixora();
  const [copied, setCopied] = useState(false);

  if (!activeSharePrompt) return null;

  const currentUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/prompt/${activeSharePrompt.slug}`
      : `https://pixora.ai/prompt/${activeSharePrompt.slug}`;

  const shareText = `Check out this stunning AI image prompt on Pixora: "${activeSharePrompt.title}"`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      addToast("Link copied to clipboard!", "Share with other creators.");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const shareChannels = [
    {
      name: "X / Twitter",
      color: "bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "WhatsApp",
      color: "bg-emerald-600 text-white hover:bg-emerald-700",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + currentUrl)}`,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0A66C2] text-white hover:bg-[#084e96]",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    },
    {
      name: "Pinterest",
      color: "bg-[#E60023] text-white hover:bg-[#c4001e]",
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(activeSharePrompt.imageUrl)}&description=${encodeURIComponent(activeSharePrompt.title)}`,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={() => setActiveSharePrompt(null)}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl p-6 shadow-2xl border border-[#E8E8E5] dark:border-[#262626] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3F3F1] dark:bg-[#202020] flex items-center justify-center text-[#111111] dark:text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#111111] dark:text-white">Share Prompt</h3>
          </div>
          <button
            onClick={() => setActiveSharePrompt(null)}
            className="p-1.5 rounded-full text-[#999999] hover:text-[#111111] dark:hover:text-white hover:bg-[#F3F3F1] dark:hover:bg-[#202020] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview snippet */}
        <div className="flex items-center gap-3 p-3 bg-[#F3F3F1] dark:bg-[#1C1C1C] rounded-2xl border border-[#E8E8E5] dark:border-[#282828]">
          <img
            src={activeSharePrompt.imageUrl}
            alt={activeSharePrompt.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-[#111111] dark:text-white truncate">{activeSharePrompt.title}</h4>
            <p className="text-[11px] text-[#6B6B6B] dark:text-[#888888]">{activeSharePrompt.aiModel} · {activeSharePrompt.category}</p>
            <span className="text-[10px] text-[#6D5DFB] font-medium">pixora.ai</span>
          </div>
        </div>

        {/* Copy link input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#6B6B6B] dark:text-[#999999]">Prompt Page Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#282828] text-xs font-mono text-[#111111] dark:text-white rounded-xl px-3 py-2.5 truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Share Social buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#6B6B6B] dark:text-[#999999]">Share to Social Media</label>
          <div className="grid grid-cols-2 gap-2">
            {shareChannels.map((channel) => (
              <a
                key={channel.name}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-colors shadow-xs ${channel.color}`}
              >
                {channel.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
