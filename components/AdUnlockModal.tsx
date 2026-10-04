"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, X, Play, Volume2, VolumeX, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import { PromptItem } from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";

interface AdUnlockModalProps {
  prompt: PromptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (promptText: string) => void;
}

export function AdUnlockModal({ prompt, isOpen, onClose, onUnlockSuccess }: AdUnlockModalProps) {
  const { userToken, recordUnlock } = usePixora();
  const [adState, setAdState] = useState<"initial" | "playing" | "verifying" | "completed">("initial");
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sponsor, setSponsor] = useState<{
    name: string;
    tagline: string;
    badge: string;
    cta: string;
    ctaUrl: string;
    accentColor: string;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [unlockedPromptText, setUnlockedPromptText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && prompt) {
      setAdState("initial");
      setSecondsLeft(5);
      setErrorMessage(null);
      setUnlockedPromptText("");

      fetch(`/api/prompts/${prompt.slug}/ad-start`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSessionId(data.sessionId);
            setSponsor(data.sponsor);
          }
        })
        .catch((err) => console.error("Failed to init ad session", err));
    }
  }, [isOpen, prompt]);

  // Handle countdown during ad playback
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adState === "playing" && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (adState === "playing" && secondsLeft === 0) {
      handleAdFinished();
    }
    return () => clearInterval(timer);
  }, [adState, secondsLeft]);

  const handleStartAd = () => {
    setAdState("playing");
    setSecondsLeft(5);
  };

  const handleAdFinished = async () => {
    if (!prompt || !sessionId) return;
    setAdState("verifying");

    try {
      const verifyRes = await fetch(`/api/prompts/${prompt.slug}/ad-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || "Ad verification failed");
      }

      const unlockRes = await fetch(`/api/prompts/${prompt.slug}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userToken }),
      });
      const unlockData = await unlockRes.json();

      if (!unlockData.success || !unlockData.promptText) {
        throw new Error(unlockData.error || "Unlock failed");
      }

      setUnlockedPromptText(unlockData.promptText);
      setAdState("completed");
      recordUnlock(prompt.id, unlockData.promptText, unlockData.token);
      onUnlockSuccess(unlockData.promptText);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6D5DFB", "#4F6BFF", "#10B981", "#F59E0B"],
        });
      } catch (e) {
        // Fallback
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "Unable to verify ad completion. Please try again.");
      setAdState("initial");
    }
  };

  if (!isOpen || !prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E8E5] dark:border-[#262626] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3F3F1] dark:bg-[#202020] flex items-center justify-center text-[#111111] dark:text-white">
              {adState === "completed" ? (
                <Unlock className="w-4 h-4 text-[#6D5DFB]" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#6B6B6B] dark:text-[#999999]">
              {adState === "completed" ? "Prompt Unlocked" : "Sponsored Unlock"}
            </span>
          </div>

          {adState !== "playing" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#999999] hover:text-[#111111] dark:hover:text-white hover:bg-[#F3F3F1] dark:hover:bg-[#202020] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* State 1: Initial Prompt */}
        {adState === "initial" && (
          <div className="p-6 pt-2 space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-[#111111] dark:text-white">
                Unlock this prompt
              </h3>
              <p className="text-sm text-[#6B6B6B] dark:text-[#999999] max-w-xs mx-auto">
                Watch a short 5-second advertisement to reveal the complete AI prompt and parameters.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F3F3F1] dark:bg-[#1C1C1C] text-left border border-[#E8E8E5] dark:border-[#282828]">
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#111111] dark:text-white truncate">{prompt.title}</p>
                <p className="text-[11px] text-[#6B6B6B] dark:text-[#888888]">{prompt.aiModel} · {prompt.category}</p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/60 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                {errorMessage}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleStartAd}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Watch & Unlock</span>
              </button>
              <p className="text-[12px] text-[#999999] dark:text-[#777777]">Takes only 5 seconds</p>
            </div>
          </div>
        )}

        {/* State 2: Active Rewarded Ad Simulation */}
        {adState === "playing" && (
          <div className="p-6 pt-2 space-y-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#6B6B6B] dark:text-[#999999]">
              <span className="bg-[#F3F3F1] dark:bg-[#222222] px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#111111] dark:text-white">
                SPONSORED
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span>Reward in</span>
                <span className="w-6 h-6 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] flex items-center justify-center text-xs font-bold">
                  {secondsLeft}s
                </span>
              </div>
            </div>

            <div className="w-full bg-[#F3F3F1] dark:bg-[#222222] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#6D5DFB] h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
              />
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1A1A] to-[#111111] text-white p-5 flex flex-col justify-between border border-[#2A2A2A] shadow-inner">
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                  {sponsor?.badge || "Featured Tool"}
                </span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded-full bg-black/40 hover:bg-black/60 text-white/80 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="space-y-1.5 z-10">
                <h4 className="text-lg font-bold tracking-tight text-white">
                  {sponsor?.name || "Runway Gen-3 Alpha"}
                </h4>
                <p className="text-xs text-white/80 line-clamp-2">
                  {sponsor?.tagline || "Next-generation generative AI tools for visual artists and filmmakers."}
                </p>
              </div>

              <div className="pt-2 z-10 flex items-center justify-between">
                <a
                  href={sponsor?.ctaUrl || "https://runwayml.com"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-[#111111] hover:bg-[#F3F3F1] transition-colors"
                >
                  <span>{sponsor?.cta || "Learn More"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className="text-[10px] text-white/60">Audio {isMuted ? "Muted" : "On"}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5DFB]/30 via-transparent to-[#4F6BFF]/20 animate-pulse pointer-events-none" />
            </div>

            <p className="text-center text-[11px] text-[#999999] dark:text-[#777777]">
              Please watch until the timer reaches zero to claim your unlocked prompt.
            </p>
          </div>
        )}

        {/* State 3: Verifying */}
        {adState === "verifying" && (
          <div className="p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#6D5DFB] mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[#111111] dark:text-white">Verifying Ad Completion</h3>
              <p className="text-xs text-[#6B6B6B] dark:text-[#999999]">Connecting with server to decrypt prompt data...</p>
            </div>
          </div>
        )}

        {/* State 4: Completed */}
        {adState === "completed" && (
          <div className="p-6 pt-2 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-[#111111] dark:text-white">Prompt Unlocked!</h3>
              <p className="text-xs text-[#6B6B6B] dark:text-[#999999]">
                You can now view, copy, and create with this exact prompt.
              </p>
            </div>

            <div className="p-3.5 bg-[#F3F3F1] dark:bg-[#1C1C1C] rounded-2xl text-left border border-[#E8E8E5] dark:border-[#282828] font-mono text-xs text-[#111111] dark:text-white max-h-24 overflow-y-auto leading-relaxed">
              {unlockedPromptText}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 font-semibold text-sm transition-colors cursor-pointer"
              >
                View Full Prompt & Parameters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
