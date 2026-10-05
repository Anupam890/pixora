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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#150F2E] rounded-3xl overflow-hidden shadow-2xl border border-[#DDD6FE] dark:border-[#271E4C] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] dark:bg-[#201844] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA]">
              {adState === "completed" ? (
                <Unlock className="w-4 h-4 text-[#8B5CF6] dark:text-[#22D3EE]" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-[#584F7C] dark:text-[#A59ECA]">
              {adState === "completed" ? "Prompt Unlocked" : "Sponsored Unlock"}
            </span>
          </div>

          {adState !== "playing" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* State 1: Initial Prompt */}
        {adState === "initial" && (
          <div className="p-6 pt-2 space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight text-[#1C143B] dark:text-[#F3F0FF]">
                Unlock this prompt
              </h3>
              <p className="text-sm text-[#584F7C] dark:text-[#A59ECA] max-w-xs mx-auto">
                Watch a short 5-second advertisement to reveal the complete AI prompt and parameters.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F4FE] dark:bg-[#1B1439] text-left border border-[#DDD6FE]/70 dark:border-[#2E245B]">
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF] truncate">{prompt.title}</p>
                <p className="text-[11px] text-[#584F7C] dark:text-[#A59ECA]">{prompt.aiModel} · {prompt.category}</p>
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
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-[#8B5CF6]/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Watch & Unlock</span>
              </button>
              <p className="text-[12px] text-[#8A81AC] dark:text-[#726A99]">Takes only 5 seconds</p>
            </div>
          </div>
        )}

        {/* State 2: Active Rewarded Ad Simulation */}
        {adState === "playing" && (
          <div className="p-6 pt-2 space-y-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#584F7C] dark:text-[#A59ECA]">
              <span className="bg-[#EDE9FE] dark:bg-[#201844] px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#7C3AED] dark:text-[#22D3EE]">
                SPONSORED
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span>Reward in</span>
                <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center text-xs font-bold">
                  {secondsLeft}s
                </span>
              </div>
            </div>

            <div className="w-full bg-[#EDE9FE] dark:bg-[#201844] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
              />
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#1A1238] to-[#0E0A24] text-white p-5 flex flex-col justify-between border border-[#8B5CF6]/30 shadow-inner">
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white text-[#1C143B] hover:bg-[#EDE9FE] transition-colors"
                >
                  <span>{sponsor?.cta || "Learn More"}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className="text-[10px] text-white/60">Audio {isMuted ? "Muted" : "On"}</span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/30 via-transparent to-[#06B6D4]/20 animate-pulse pointer-events-none" />
            </div>

            <p className="text-center text-[11px] text-[#8A81AC] dark:text-[#726A99]">
              Please watch until the timer reaches zero to claim your unlocked prompt.
            </p>
          </div>
        )}

        {/* State 3: Verifying */}
        {adState === "verifying" && (
          <div className="p-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#8B5CF6] mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[#1C143B] dark:text-[#F3F0FF]">Verifying Ad Completion</h3>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">Connecting with server to decrypt prompt data...</p>
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
              <h3 className="text-2xl font-bold text-[#1C143B] dark:text-[#F3F0FF]">Prompt Unlocked!</h3>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
                You can now view, copy, and create with this exact prompt.
              </p>
            </div>

            <div className="p-3.5 bg-[#F6F4FE] dark:bg-[#1B1439] rounded-2xl text-left border border-[#DDD6FE]/70 dark:border-[#2E245B] font-mono text-xs text-[#1C143B] dark:text-[#F3F0FF] max-h-24 overflow-y-auto leading-relaxed">
              {unlockedPromptText}
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-sm shadow-md shadow-[#8B5CF6]/25 transition-all cursor-pointer"
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
