"use client";

import React from "react";
import { X, Sparkles, Check, Zap, ShieldCheck } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function ProModal() {
  const { isProModalOpen, setIsProModalOpen, isProUser, toggleProUser } = usePixora();

  if (!isProModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={() => setIsProModalOpen(false)}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E8E5] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Pixora Pro</span>
          </div>

          <button
            onClick={() => setIsProModalOpen(false)}
            className="p-1.5 rounded-full text-[#999999] hover:text-[#111111] hover:bg-[#F3F3F1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-3xl font-extrabold text-[#111111] tracking-tight">
            Unlock the entire library, instantly.
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Say goodbye to ads. Get direct, zero-delay access to every AI prompt, secret parameter, and workflow preset.
          </p>
        </div>

        {/* Pricing Card comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free plan */}
          <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E8E8E5] space-y-3">
            <div>
              <p className="text-xs font-bold text-[#6B6B6B] uppercase">Free Tier</p>
              <p className="text-2xl font-bold text-[#111111]">$0</p>
              <p className="text-[11px] text-[#999999]">Ad-supported discovery</p>
            </div>
            <ul className="space-y-2 text-xs text-[#6B6B6B]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unlimited visual discovery</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Watch 5-sec ads to unlock</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save favorites</span>
              </li>
            </ul>
          </div>

          {/* Pro plan */}
          <div className="p-4 rounded-2xl bg-[#111111] text-white border border-[#222222] shadow-lg relative space-y-3">
            <div className="absolute top-3 right-3 bg-[#6D5DFB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Popular
            </div>
            <div>
              <p className="text-xs font-bold text-[#6D5DFB] uppercase">Pixora Pro</p>
              <p className="text-2xl font-bold text-white">
                $9 <span className="text-xs font-normal text-white/60">/ month</span>
              </p>
              <p className="text-[11px] text-white/60">For serious creators</p>
            </div>
            <ul className="space-y-2 text-xs text-white/90">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Ads · Instant 1-Click Unlocks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#6D5DFB]" />
                <span>Custom Collections & History</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#6D5DFB]" />
                <span>Copy without parameters</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6D5DFB]" />
                <span>Commercial usage presets</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Toggle (Simulates real Pro subscription) */}
        <div className="pt-2 space-y-3">
          <button
            onClick={() => {
              toggleProUser();
              setIsProModalOpen(false);
            }}
            className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-md ${
              isProUser
                ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                : "bg-[#6D5DFB] hover:bg-[#5947F5] text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProUser ? "Revert to Free Ad-Supported Mode" : "Activate Pro Plan Now (Free Demo Mode)"}</span>
          </button>
          <p className="text-center text-[11px] text-[#999999]">
            Instant toggle enabled for evaluation. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
}
