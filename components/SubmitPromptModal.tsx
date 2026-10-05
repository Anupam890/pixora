"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  X,
  Upload,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import {
  CategoryType,
  AIModelType,
  StyleType,
  AspectRatioType,
} from "@/lib/types";
import { usePixora } from "@/lib/context/PixoraContext";

const CATEGORIES: CategoryType[] = [
  "Portrait",
  "Photography",
  "Fashion",
  "Product",
  "Cinematic",
  "Anime",
  "3D",
  "Fantasy",
  "Interior",
  "Art",
  "Social Media",
  "E-commerce",
];

const AI_MODELS: AIModelType[] = [
  "Midjourney",
  "Flux",
  "Stable Diffusion",
  "ChatGPT Image",
  "Ideogram",
  "Leonardo",
  "Other",
];

const STYLES: StyleType[] = [
  "Photorealistic",
  "Cinematic",
  "Minimal",
  "Editorial",
  "Luxury",
  "Vintage",
  "Anime",
  "3D",
  "Illustration",
  "Surreal",
];

const ASPECT_RATIOS: AspectRatioType[] = ["1:1", "16:9", "9:16", "4:5", "3:2", "2:3"];

export function SubmitPromptModal() {
  const { isSubmitModalOpen, setIsSubmitModalOpen, addToast, recordSubmission } = usePixora();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState<CategoryType>("Portrait");
  const [aiModel, setAiModel] = useState<AIModelType>("Midjourney");
  const [style, setStyle] = useState<StyleType>("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>("16:9");
  const [tags, setTags] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorHandle, setAuthorHandle] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Optional Parameters
  const [showParameters, setShowParameters] = useState(false);
  const [version, setVersion] = useState("v 6.1");
  const [stylize, setStylize] = useState("");
  const [chaos, setChaos] = useState("");
  const [seed, setSeed] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  // Upload & Submit Status
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isSubmitModalOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        addToast("Image Uploaded", "Stored on Cloudinary CDN for instant loading.");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image to Cloudinary");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast("Missing Title", "Please give your artwork a title.", "warning");
      return;
    }

    if (!promptText.trim()) {
      addToast("Missing Prompt", "Please include the AI prompt text used.", "warning");
      return;
    }

    if (!imageUrl.trim()) {
      addToast("Missing Image", "Please upload an image or provide an image URL.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        promptText: promptText.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim(),
        category,
        aiModel,
        style,
        aspectRatio,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorName: authorName.trim() || "Community Creator",
        authorHandle: authorHandle.trim()
          ? authorHandle.startsWith("@")
            ? authorHandle
            : `@${authorHandle}`
          : "@creator",
        userEmail: userEmail.trim() || undefined,
        parameters: {
          version: version.trim() || undefined,
          stylize: stylize ? Number(stylize) : undefined,
          chaos: chaos ? Number(chaos) : undefined,
          seed: seed ? Number(seed) : undefined,
          negativePrompt: negativePrompt.trim() || undefined,
        },
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.submission) {
        recordSubmission(data.submission.id);
        setIsSubmittedSuccess(true);
        addToast(
          "Prompt Submitted!",
          "Thank you! Our curation team will review and publish it soon."
        );
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          setIsSubmittedSuccess(false);
          resetForm();
        }, 2200);
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (err: unknown) {
      console.error(err);
      addToast(
        "Submission Error",
        err instanceof Error ? err.message : "Failed to submit prompt",
        "warning"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPromptText("");
    setDescription("");
    setImageUrl("");
    setTags("");
    setAuthorName("");
    setAuthorHandle("");
    setUserEmail("");
    setStylize("");
    setChaos("");
    setSeed("");
    setNegativePrompt("");
    setUploadError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200 overflow-y-auto"
      onClick={() => setIsSubmitModalOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#150F2E] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#DDD6FE] dark:border-[#271E4C] space-y-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DDD6FE]/60 dark:border-[#271E4C] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#06B6D4] text-white flex items-center justify-center shadow-md shadow-[#8B5CF6]/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-[#1C143B] dark:text-[#F3F0FF] tracking-tight">
                Submit an AI Prompt
              </h2>
              <p className="text-xs text-[#584F7C] dark:text-[#A59ECA]">
                Share your artwork and prompt blueprint with the Pixora creative community.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(false)}
            className="p-2 rounded-full text-[#8A81AC] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {isSubmittedSuccess ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1C143B] dark:text-white">Submission Received!</h3>
              <p className="text-xs sm:text-sm text-[#584F7C] dark:text-[#A59ECA] max-w-sm mx-auto">
                Your prompt blueprint has been entered into the moderation queue. Once approved, it will be published to the public library!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* Visual Upload Section (Cloudinary) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF] flex items-center justify-between">
                <span>Visual Artwork (Required)</span>
                <span className="text-[11px] font-normal text-[#8A81AC]">Stored on Cloudinary CDN</span>
              </label>

              {/* Upload tabs */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setUploadMethod("upload")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    uploadMethod === "upload"
                      ? "bg-[#EDE9FE] dark:bg-[#201844] text-[#7C3AED] dark:text-[#22D3EE]"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B]"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    uploadMethod === "url"
                      ? "bg-[#EDE9FE] dark:bg-[#201844] text-[#7C3AED] dark:text-[#22D3EE]"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B]"
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {uploadMethod === "upload" ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    imageUrl
                      ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/10"
                      : "border-[#DDD6FE] dark:border-[#271E4C] hover:border-[#8B5CF6] dark:hover:border-[#8B5CF6]/70 bg-[#F6F4FE]/50 dark:bg-[#100C22]"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="hidden"
                  />

                  {isUploading ? (
                    <div className="py-4 flex flex-col items-center gap-2 text-xs text-[#7C3AED] dark:text-[#22D3EE]">
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span>Uploading to Cloudinary CDN...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#DDD6FE] dark:border-[#2E245B] shadow-sm shrink-0">
                        <Image src={imageUrl} alt="Uploaded preview" fill className="object-cover" />
                      </div>
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Image Uploaded Successfully</span>
                        </div>
                        <p className="text-[11px] text-[#584F7C] dark:text-[#A59ECA] font-mono break-all line-clamp-2">
                          {imageUrl}
                        </p>
                        <span className="text-[10px] text-[#7C3AED] dark:text-[#22D3EE] font-semibold underline block">
                          Click to change file
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#201844] text-[#7C3AED] dark:text-[#22D3EE] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF]">
                        Drag & drop artwork, or <span className="text-[#7C3AED] dark:text-[#22D3EE]">browse</span>
                      </p>
                      <p className="text-[11px] text-[#8A81AC]">Supports PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A81AC]" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] focus:border-[#8B5CF6] focus:outline-none"
                  />
                </div>
              )}

              {uploadError && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF]">
                  Artwork Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Neon Cyberpunk Geisha in Acid Rain"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3.5 py-2.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] focus:border-[#8B5CF6] focus:outline-none"
                  required
                />
              </div>

              {/* Prompt Text Blueprint */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF] flex items-center justify-between">
                  <span>Prompt Blueprint <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-normal text-[#8A81AC]">Unlocked by creators after 5s ad</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste the complete generation prompt text, camera angles, lighting and model flags (e.g. --ar 16:9 --v 6.1 --stylize 350)..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full font-mono bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl p-3 text-xs leading-relaxed text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] focus:border-[#8B5CF6] focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF]">
                  Short Creative Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dramatic cinematic studio lighting with deep chiaroscuro contrasts."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            {/* Classification: Category, Model, Style, Aspect Ratio */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">AI Model</label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as AIModelType)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-2.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-2.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">Aesthetic Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as StyleType)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-2.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-2.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                >
                  {ASPECT_RATIOS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C143B] dark:text-[#F3F0FF]">
                Tags & Keywords (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. portrait, chiaroscuro, 85mm, vogue, cyberpunk"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3.5 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] focus:border-[#8B5CF6] focus:outline-none"
              />
            </div>

            {/* Optional Advanced Parameters Accordion */}
            <div className="border border-[#DDD6FE]/70 dark:border-[#271E4C] rounded-2xl p-3 bg-[#F6F4FE]/50 dark:bg-[#100C22]/50 space-y-3">
              <button
                type="button"
                onClick={() => setShowParameters(!showParameters)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>Advanced Parameters (Negative prompt, Stylize, Seed)</span>
                </div>
                {showParameters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showParameters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#584F7C] dark:text-[#A59ECA]">Version</label>
                    <input
                      type="text"
                      placeholder="v 6.1 / Flux.1"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] rounded-xl px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#584F7C] dark:text-[#A59ECA]">Stylize (--s)</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={stylize}
                      onChange={(e) => setStylize(e.target.value)}
                      className="w-full bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] rounded-xl px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#584F7C] dark:text-[#A59ECA]">Seed</label>
                    <input
                      type="text"
                      placeholder="e.g. 849201"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      className="w-full bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] rounded-xl px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-semibold text-[#584F7C] dark:text-[#A59ECA]">
                      Negative Prompt (--no / negative keywords)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cartoon, blurry, low resolution, bad anatomy"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="w-full bg-white dark:bg-[#161133] border border-[#DDD6FE] dark:border-[#2E245B] rounded-xl px-3 py-1.5 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Creator Attribution */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">Creator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Lin"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">Social Handle</label>
                <input
                  type="text"
                  placeholder="e.g. @mayalin"
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#584F7C] dark:text-[#A59ECA]">
                  Email (Optional for notification)
                </label>
                <input
                  type="email"
                  placeholder="creator@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-[#F6F4FE] dark:bg-[#100C22] border border-[#DDD6FE] dark:border-[#271E4C] rounded-xl px-3 py-2 text-xs text-[#1C143B] dark:text-[#F3F0FF] focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DDD6FE]/60 dark:border-[#271E4C]">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#584F7C] dark:text-[#A59ECA] hover:bg-[#EDE9FE] dark:hover:bg-[#201844] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white font-semibold text-xs shadow-md shadow-[#8B5CF6]/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Submit Prompt for Curation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
