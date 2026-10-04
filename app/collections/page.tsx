"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  ArrowLeft,
  X,
  Trash2,
} from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";
import { PromptItem } from "@/lib/types";
import { PromptCard } from "@/components/PromptCard";

export default function CollectionsPage() {
  const { collections, createCollection, removeFromCollection, userToken } = usePixora();
  const [selectedColId, setSelectedColId] = useState<string>(collections[0]?.id || "");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColDesc, setNewColDesc] = useState("");
  const [allPrompts, setAllPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts?token=${userToken}`);
        const data = await res.json();
        if (data.success) {
          setAllPrompts(data.prompts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, [userToken]);

  const activeCollection = collections.find((c) => c.id === selectedColId) || collections[0];
  const collectionPrompts = activeCollection
    ? allPrompts.filter((p) => activeCollection.promptIds.includes(p.id))
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const created = createCollection(newColName.trim(), newColDesc.trim());
    setSelectedColId(created.id);
    setNewColName("");
    setNewColDesc("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6B6B] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight">
            Curated Collections
          </h1>
          <p className="text-xs text-[#6B6B6B] dark:text-[#999999]">
            Organize your prompt discoveries into custom creative moodboards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111111] dark:bg-white hover:bg-[#2A2A2A] dark:hover:bg-gray-100 text-white dark:text-[#111111] text-xs font-semibold shadow-xs transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#E8E8E5] dark:border-[#222222] pb-2">
        {collections.map((col) => {
          const isSelected = col.id === activeCollection?.id;
          return (
            <button
              key={col.id}
              onClick={() => setSelectedColId(col.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs"
                  : "bg-white dark:bg-[#141414] hover:bg-[#F3F3F1] dark:hover:bg-[#1C1C1C] text-[#6B6B6B] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white border border-[#E8E8E5] dark:border-[#262626]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{col.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#111111]"
                    : "bg-[#F3F3F1] dark:bg-[#1F1F1F] text-[#6B6B6B] dark:text-[#999999]"
                }`}
              >
                {col.promptIds.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Collection Details & Items */}
      {activeCollection && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-[#141414] rounded-2xl border border-[#E8E8E5] dark:border-[#222222] flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#111111] dark:text-white">{activeCollection.name}</h2>
              <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">
                {activeCollection.description || "Curated list of AI prompts"}
              </p>
            </div>
            <span className="text-xs font-medium text-[#999999] dark:text-[#666666]">
              {collectionPrompts.length} Prompts saved
            </span>
          </div>

          {collectionPrompts.length > 0 ? (
            <div className="masonry-grid">
              {collectionPrompts.map((p) => (
                <div key={p.id} className="relative group/colitem">
                  <PromptCard prompt={p} />
                  <button
                    onClick={() => removeFromCollection(activeCollection.id, p.id)}
                    className="absolute top-4 right-14 z-20 p-2 rounded-full bg-white/90 dark:bg-black/80 hover:bg-red-50 dark:hover:bg-red-950/60 text-gray-500 hover:text-red-600 shadow-sm opacity-0 group-hover/colitem:opacity-100 transition-opacity cursor-pointer"
                    title="Remove from collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#141414] rounded-3xl border border-[#E8E8E5] dark:border-[#222222] p-8 space-y-3 max-w-md mx-auto">
              <Layers className="w-8 h-8 text-[#999999] dark:text-[#666666] mx-auto" />
              <h4 className="font-bold text-sm text-[#111111] dark:text-white">This collection is empty</h4>
              <p className="text-xs text-[#6B6B6B] dark:text-[#888888]">
                Browse prompts in the gallery and click "Save to Collection" to populate this moodboard.
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-semibold cursor-pointer"
              >
                Discover Prompts
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#141414] rounded-3xl p-6 shadow-2xl border border-[#E8E8E5] dark:border-[#262626] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#111111] dark:text-white">Create New Collection</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Aesthetics, Luxury Cosmetics"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#2C2C2C] rounded-xl px-3 py-2 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#6D5DFB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#111111] dark:text-[#EDEDED]">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="What is this collection for?"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-[#FAFAF9] dark:bg-[#1C1C1C] border border-[#E8E8E5] dark:border-[#2C2C2C] rounded-xl p-3 text-xs text-[#111111] dark:text-white focus:outline-none focus:border-[#6D5DFB]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-[#F3F3F1] dark:hover:bg-[#1C1C1C] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#111111] dark:bg-white hover:bg-[#2A2A2A] dark:hover:bg-gray-100 text-white dark:text-[#111111] text-xs font-semibold cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
