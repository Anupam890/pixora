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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#554D74] dark:text-[#A59ECA] hover:text-[#8B5CF6] dark:hover:text-[#22D3EE] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-white dark:via-purple-100 dark:to-cyan-200 bg-clip-text text-transparent">
            Curated Collections
          </h1>
          <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
            Organize your prompt discoveries into custom creative moodboards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-purple-200/50 dark:border-[#8B5CF6]/20 pb-3">
        {collections.map((col) => {
          const isSelected = col.id === activeCollection?.id;
          return (
            <button
              key={col.id}
              onClick={() => setSelectedColId(col.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-purple-500/30"
                  : "bg-white dark:bg-[#150F2E] hover:bg-purple-50 dark:hover:bg-[#1D153E] text-[#554D74] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-white border border-purple-200/50 dark:border-[#8B5CF6]/20"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{col.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-purple-100 dark:bg-[#090714] text-[#8B5CF6] dark:text-[#22D3EE]"
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
          <div className="p-6 bg-white dark:bg-[#150F2E] rounded-2xl border border-purple-200/50 dark:border-[#8B5CF6]/30 flex items-center justify-between shadow-md shadow-purple-950/10">
            <div>
              <h2 className="text-xl font-bold text-[#1C143B] dark:text-white">{activeCollection.name}</h2>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                {activeCollection.description || "Curated list of AI prompts"}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-[#090714] text-[#8B5CF6] dark:text-[#22D3EE] border border-[#8B5CF6]/20">
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
                    className="absolute top-4 right-14 z-20 p-2 rounded-full bg-[#150F2E]/90 hover:bg-red-500/20 text-[#A59ECA] hover:text-red-400 shadow-md border border-[#8B5CF6]/30 opacity-0 group-hover/colitem:opacity-100 transition-all cursor-pointer backdrop-blur-md"
                    title="Remove from collection"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#150F2E] rounded-3xl border border-purple-200/50 dark:border-[#8B5CF6]/30 p-8 space-y-3 max-w-md mx-auto shadow-xl shadow-purple-950/20">
              <Layers className="w-8 h-8 text-[#8B5CF6] dark:text-[#22D3EE] mx-auto opacity-70" />
              <h4 className="font-bold text-sm text-[#1C143B] dark:text-white">This collection is empty</h4>
              <p className="text-xs text-[#554D74] dark:text-[#A59ECA]">
                Browse prompts in the gallery and click "Save to Collection" to populate this moodboard.
              </p>
              <Link
                href="/"
                className="inline-block px-5 py-2.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090714]/80 backdrop-blur-md animate-in fade-in-0 duration-200"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#150F2E] rounded-3xl p-6 shadow-2xl shadow-purple-950/60 border border-[#8B5CF6]/30 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Create New Collection</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-[#A59ECA] hover:text-white hover:bg-[#8B5CF6]/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A59ECA]">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Aesthetics, Luxury Cosmetics"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A59ECA]">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="What is this collection for?"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full bg-[#0F0C20] border border-[#8B5CF6]/30 rounded-xl p-3 text-xs text-white placeholder-[#554D74] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#A59ECA] hover:bg-[#8B5CF6]/15 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-purple-500/25 hover:shadow-cyan-500/25 transition-all cursor-pointer"
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
