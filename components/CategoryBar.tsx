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
    <div className="w-full border-b border-[#DDD6FE]/70 dark:border-[#271E4C]/80 bg-[#F6F4FE]/85 dark:bg-[#090714]/85 backdrop-blur-md sticky top-16 z-30 py-3 transition-colors">
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
                    ? "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-[#8B5CF6]/30 font-semibold scale-[1.02]"
                    : "bg-white/80 dark:bg-[#150F2E]/80 hover:bg-[#EDE9FE] dark:hover:bg-[#1F1746] text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] border border-[#DDD6FE] dark:border-[#2C2156]"
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
