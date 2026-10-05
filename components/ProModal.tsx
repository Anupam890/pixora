"use client";

import React from "react";
import { X, Sparkles, Check, Zap, ShieldCheck } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function ProModal() {
  const { isProModalOpen, setIsProModalOpen, isProUser, toggleProUser } = usePixora();

  if (!isProModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={() => setIsProModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#150F2E] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#DDD6FE] dark:border-[#271E4C] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#8B5CF6]/15 to-[#06B6D4]/15 border border-[#8B5CF6]/30 text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#22D3EE]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#22D3EE]" />
            <span>Pixora Pro</span>
          </div>

          <button
            onClick={() => setIsProModalOpen(false)}
            className="p-1.5 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold text-[#1C143B] dark:text-[#F3F0FF] tracking-tight">
            Unlock the entire library, instantly.
          </h3>
          <p className="text-sm text-[#584F7C] dark:text-[#A59ECA] leading-relaxed">
            Say goodbye to ads. Get direct, zero-delay access to every AI prompt, secret parameter, and workflow preset.
          </p>
        </div>

        {/* Pricing Card comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free plan */}
          <div className="p-4 rounded-2xl bg-[#F6F4FE] dark:bg-[#1B1439] border border-[#DDD6FE]/70 dark:border-[#2E245B] space-y-3">
            <div>
              <p className="text-xs font-bold text-[#584F7C] dark:text-[#A59ECA] uppercase">Free Tier</p>
              <p className="text-2xl font-bold text-[#1C143B] dark:text-[#F3F0FF]">$0</p>
              <p className="text-[11px] text-[#8A81AC] dark:text-[#726A99]">Ad-supported discovery</p>
            </div>
            <ul className="space-y-2 text-xs text-[#584F7C] dark:text-[#A59ECA]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Unlimited visual discovery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Watch 5-sec ads to unlock</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Save favorites</span>
              </li>
            </ul>
          </div>

          {/* Pro plan */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1F1746] to-[#120D2D] text-white border border-[#8B5CF6]/40 shadow-xl shadow-[#8B5CF6]/15 relative space-y-3">
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Popular
            </div>
            <div>
              <p className="text-xs font-bold text-[#22D3EE] uppercase">Pixora Pro</p>
              <p className="text-2xl font-bold text-white">
                $9 <span className="text-xs font-normal text-white/60">/ month</span>
              </p>
              <p className="text-[11px] text-[#A59ECA]">For serious creators</p>
            </div>
            <ul className="space-y-2 text-xs text-white/90">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Zero Ads · Instant 1-Click Unlocks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Custom Collections & History</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Copy without parameters</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Commercial usage presets</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Toggle */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => {
              toggleProUser();
              setIsProModalOpen(false);
            }}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              isProUser
                ? "bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
                : "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white shadow-[#8B5CF6]/30"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProUser ? "Revert to Free Ad-Supported Mode" : "Activate Pro Plan Now (Free Demo Mode)"}</span>
          </button>
          <p className="text-center text-[11px] text-[#8A81AC] dark:text-[#726A99]">
            Instant toggle enabled for evaluation. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
