"use client";

import React, { useState } from "react";
import { X, Flag, AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function ReportModal() {
  const { activeReportPrompt, setActiveReportPrompt, addToast } = usePixora();
  const [reason, setReason] = useState<string>("incorrect_prompt");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeReportPrompt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: activeReportPrompt.id,
          promptTitle: activeReportPrompt.title,
          reason,
          details,
          userEmail: email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        addToast("Report Submitted", "Thank you. Our moderation team will review this prompt.", "info");
        setTimeout(() => {
          setActiveReportPrompt(null);
          setSubmitted(false);
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportReasons = [
    { value: "incorrect_prompt", label: "Incorrect prompt or wrong AI parameters" },
    { value: "copyright", label: "Copyright / Intellectual Property concern" },
    { value: "nsfw", label: "NSFW or inappropriate imagery" },
    { value: "spam", label: "Spam or irrelevant content" },
    { value: "broken_image", label: "Broken image link or distorted preview" },
    { value: "misleading", label: "Misleading model tag or deceptive description" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
      onClick={() => setActiveReportPrompt(null)}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#150F2E] rounded-3xl p-6 shadow-2xl border border-[#DDD6FE] dark:border-[#271E4C] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/60 text-red-500 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#1C143B] dark:text-[#F3F0FF]">Report Prompt</h3>
          </div>
          <button
            onClick={() => setActiveReportPrompt(null)}
            className="p-1.5 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-lg text-[#1C143B] dark:text-[#F3F0FF]">Thank you for your report</h4>
            <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">Our moderation team has received the item and is reviewing it.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
              Help keep Pixora a curated, high-quality library. Please indicate the issue with{" "}
              <strong className="text-[#1C143B] dark:text-[#F3F0FF]">"{activeReportPrompt.title}"</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF]">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#F6F4FE] dark:bg-[#120D28] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3 py-2.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:outline-none focus:border-[#8B5CF6]"
              >
                {reportReasons.map((r) => (
                  <option key={r.value} value={r.value} className="dark:bg-[#120D28]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF]">Additional details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe the discrepancy or problem..."
                className="w-full bg-[#F6F4FE] dark:bg-[#120D28] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl p-3 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C143B] dark:text-[#F3F0FF]">Your email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-[#F6F4FE] dark:bg-[#120D28] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveReportPrompt(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Submitting..." : "Submit Report"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
