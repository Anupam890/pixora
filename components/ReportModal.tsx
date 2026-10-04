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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={() => setActiveReportPrompt(null)}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E8E5] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-[#111111]">Report Prompt</h3>
          </div>
          <button
            onClick={() => setActiveReportPrompt(null)}
            className="p-1.5 rounded-full text-[#999999] hover:text-[#111111] hover:bg-[#F3F3F1] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-lg text-[#111111]">Thank you for your report</h4>
            <p className="text-xs text-[#6B6B6B]">Our moderation team has received the item and is reviewing it.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[#6B6B6B]">
              Help keep Pixora a curated, high-quality library. Please indicate the issue with{" "}
              <strong className="text-[#111111]">"{activeReportPrompt.title}"</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111]">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#FAFAF9] border border-[#E8E8E5] rounded-xl px-3 py-2.5 text-xs text-[#111111] focus:outline-none focus:border-[#6D5DFB]"
              >
                {reportReasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111]">Additional details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Describe the discrepancy or problem..."
                className="w-full bg-[#FAFAF9] border border-[#E8E8E5] rounded-xl p-3 text-xs text-[#111111] focus:outline-none focus:border-[#6D5DFB]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111111]">Your email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                className="w-full bg-[#FAFAF9] border border-[#E8E8E5] rounded-xl px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#6D5DFB]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveReportPrompt(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#6B6B6B] hover:bg-[#F3F3F1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
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
