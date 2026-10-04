"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Heart,
  Sparkles,
  Lock,
  Unlock,
  Menu,
  X,
  Compass,
  Flame,
  Clock,
  Layers,
  Sun,
  Moon,
} from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { favorites, unlockedPromptIds, isProUser, setIsProModalOpen, theme, toggleTheme } = usePixora();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Explore", href: "/", icon: Compass },
    { label: "Trending", href: "/search?sort=trending", icon: Flame },
    { label: "New", href: "/search?sort=newest", icon: Clock },
    { label: "Collections", href: "/collections", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF9]/90 dark:bg-[#0C0C0C]/90 backdrop-blur-md border-b border-[#E8E8E5] dark:border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#111111] dark:bg-white dark:text-[#111111] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-[#111111] dark:text-white">
                PIXORA
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "text-[#111111] dark:text-white bg-[#EBEBE7] dark:bg-[#1F1F1F]"
                      : "text-[#6B6B6B] dark:text-[#9E9E9E] hover:text-[#111111] dark:hover:text-white hover:bg-[#F3F3F1] dark:hover:bg-[#181818]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] dark:text-[#666666]" />
            <input
              type="text"
              placeholder="Search prompts, styles, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F3F1] dark:bg-[#161616] hover:bg-[#EBEBE7]/70 dark:hover:bg-[#1D1D1D] focus:bg-white dark:focus:bg-[#1C1C1C] text-sm text-[#111111] dark:text-[#EDEDED] placeholder-[#999999] dark:placeholder-[#666666] pl-10 pr-4 py-2 rounded-full border border-transparent dark:border-[#222222] focus:border-[#6D5DFB]/40 focus:outline-none transition-all"
            />
          </form>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-[#F3F3F1] dark:hover:bg-[#1C1C1C] transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-[#6B6B6B] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Unlocked Badges */}
          <Link
            href="/profile"
            title="Unlocked Prompts"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F3F3F1] dark:bg-[#181818] hover:bg-[#EBEBE7] dark:hover:bg-[#202020] text-[#111111] dark:text-[#EDEDED] border border-[#E8E8E5] dark:border-[#262626] transition-colors"
          >
            {unlockedPromptIds.size > 0 ? (
              <Unlock className="w-3.5 h-3.5 text-[#6D5DFB]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#999999]" />
            )}
            <span>{unlockedPromptIds.size} Unlocked</span>
          </Link>

          {/* Favorites */}
          <Link
            href="/favorites"
            className="relative p-2 rounded-full text-[#6B6B6B] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-[#F3F3F1] dark:hover:bg-[#181818] transition-colors"
            title="Favorites"
          >
            <Heart className={`w-5 h-5 ${favorites.size > 0 ? "fill-red-500 text-red-500" : ""}`} />
            {favorites.size > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#111111] dark:bg-white dark:text-[#111111] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {favorites.size}
              </span>
            )}
          </Link>

          {/* Pro Subscription Pill */}
          <button
            onClick={() => setIsProModalOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isProUser
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                : "bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#2A2A2A] dark:hover:bg-gray-100 shadow-sm hover:shadow"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isProUser ? "PRO ACTIVE" : "GET PRO"}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#111111] dark:text-white md:hidden hover:bg-[#F3F3F1] dark:hover:bg-[#181818]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8E8E5] dark:border-[#222222] bg-white dark:bg-[#111111] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] dark:text-[#666666]" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F3F3F1] dark:bg-[#1A1A1A] text-sm text-[#111111] dark:text-white pl-9 pr-4 py-2.5 rounded-xl border border-transparent dark:border-[#262626] focus:border-[#6D5DFB] focus:outline-none"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#111111] dark:text-[#EDEDED] hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A]"
              >
                <item.icon className="w-4 h-4 text-[#6B6B6B] dark:text-[#9E9E9E]" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#111111] dark:text-[#EDEDED] hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A]"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Favorites</span>
              </div>
              <span className="text-xs bg-[#F3F3F1] dark:bg-[#1F1F1F] px-2 py-0.5 rounded-full font-semibold">
                {favorites.size}
              </span>
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#111111] dark:text-[#EDEDED] hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A]"
            >
              <div className="flex items-center gap-3">
                <Unlock className="w-4 h-4 text-[#6D5DFB]" />
                <span>Unlock History</span>
              </div>
              <span className="text-xs bg-[#F3F3F1] dark:bg-[#1F1F1F] px-2 py-0.5 rounded-full font-semibold">
                {unlockedPromptIds.size}
              </span>
            </Link>
          </nav>

          <div className="flex items-center justify-between pt-2 border-t border-[#E8E8E5] dark:border-[#222222]">
            <span className="text-xs text-[#6B6B6B] dark:text-[#999999]">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#F3F3F1] dark:bg-[#1A1A1A] text-[#111111] dark:text-white"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsProModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isProUser ? "Pixora Pro Active" : "Upgrade to Pixora Pro"}</span>
          </button>
        </div>
      )}
    </header>
  );
}
