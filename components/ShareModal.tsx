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
      color: "bg-[#1D153E] text-white hover:bg-[#271E4C] border border-[#8B5CF6]/30",
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={() => setActiveSharePrompt(null)}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#150F2E] rounded-3xl p-6 shadow-2xl border border-[#DDD6FE] dark:border-[#271E4C] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#201844] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA]">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C143B] dark:text-[#F3F0FF]">Share Prompt</h3>
          </div>
          <button
            onClick={() => setActiveSharePrompt(null)}
            className="p-1.5 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview snippet */}
        <div className="flex items-center gap-3 p-3 bg-[#F6F4FE] dark:bg-[#1B1439] rounded-2xl border border-[#DDD6FE]/70 dark:border-[#2E245B]">
          <img
            src={activeSharePrompt.imageUrl}
            alt={activeSharePrompt.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-xs text-[#1C143B] dark:text-[#F3F0FF] truncate">{activeSharePrompt.title}</h4>
            <p className="text-[11px] text-[#584F7C] dark:text-[#A59ECA]">{activeSharePrompt.aiModel} · {activeSharePrompt.category}</p>
            <span className="text-[10px] text-[#8B5CF6] dark:text-[#22D3EE] font-medium">pixora.ai</span>
          </div>
        </div>

        {/* Copy link input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#584F7C] dark:text-[#A59ECA]">Prompt Page Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-[#F6F4FE] dark:bg-[#120D28] border border-[#DDD6FE] dark:border-[#271E4C] text-xs font-mono text-[#1C143B] dark:text-[#F3F0FF] rounded-xl px-3 py-2.5 truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-[#8B5CF6]/25 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Share Social buttons */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#584F7C] dark:text-[#A59ECA]">Share to Social Media</label>
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
