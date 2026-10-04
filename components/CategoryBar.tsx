"use client";

import React from "react";
import { CategoryType } from "@/lib/types";

interface CategoryBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: (CategoryType | "All")[] = [
  "All",
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

export function CategoryBar({ activeCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full border-b border-[#E8E8E5] bg-[#FAFAF9] sticky top-16 z-30 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-white hover:bg-[#F3F3F1] text-[#6B6B6B] hover:text-[#111111] border border-[#E8E8E5]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
