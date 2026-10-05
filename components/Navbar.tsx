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
  const { favorites, isProUser, setIsProModalOpen, theme, toggleTheme, setIsSubmitModalOpen } = usePixora();
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
    <header className="sticky top-0 z-40 w-full bg-[#F6F4FE]/85 dark:bg-[#090714]/85 backdrop-blur-xl border-b border-[#DDD6FE]/70 dark:border-[#271E4C]/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] via-[#6366F1] to-[#06B6D4] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-md shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#0891B2] dark:from-[#A78BFA] dark:via-[#818CF8] dark:to-[#22D3EE] bg-clip-text text-transparent">
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
                      ? "text-[#7C3AED] dark:text-[#A78BFA] bg-[#EDE9FE] dark:bg-[#201844] font-semibold shadow-xs"
                      : "text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE]/70 dark:hover:bg-[#1A143B]"
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A81AC] dark:text-[#726A99]" />
            <input
              type="text"
              placeholder="Search prompts, styles, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EDE9FE]/60 dark:bg-[#120D28] hover:bg-[#EDE9FE] dark:hover:bg-[#181235] focus:bg-white dark:focus:bg-[#1C153E] text-sm text-[#1C143B] dark:text-[#F3F0FF] placeholder-[#8A81AC] dark:placeholder-[#726A99] pl-10 pr-4 py-2 rounded-full border border-[#DDD6FE] dark:border-[#271E4C] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 focus:outline-none transition-all"
            />
          </form>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Submit Prompt CTA */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            title="Submit your AI Prompt"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EDE9FE] dark:bg-[#1E1642] hover:bg-[#DDD6FE] dark:hover:bg-[#281D58] text-[#7C3AED] dark:text-[#22D3EE] border border-[#DDD6FE] dark:border-[#34246E] shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6] dark:text-[#22D3EE]" />
            <span>Submit Prompt</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE]/70 dark:hover:bg-[#1A143B] transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-[#584F7C] hover:-rotate-12 transition-transform" />
            )}
          </button>

          {/* Favorites */}
          <Link
            href="/favorites"
            className="relative p-2 rounded-full text-[#584F7C] dark:text-[#A59ECA] hover:text-[#1C143B] dark:hover:text-[#F3F0FF] hover:bg-[#EDE9FE]/70 dark:hover:bg-[#1A143B] transition-colors"
            title="Favorites"
          >
            <Heart className={`w-5 h-5 ${favorites.size > 0 ? "fill-red-500 text-red-500" : ""}`} />
            {favorites.size > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {favorites.size}
              </span>
            )}
          </Link>

          {/* Pro Subscription Pill */}
          <button
            onClick={() => setIsProModalOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              isProUser
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm"
                : "bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white shadow-md shadow-[#8B5CF6]/25 hover:shadow-lg hover:shadow-[#8B5CF6]/35"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isProUser ? "PRO ACTIVE" : "GET PRO"}</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1C143B] dark:text-[#F3F0FF] md:hidden hover:bg-[#EDE9FE]/70 dark:hover:bg-[#1A143B]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#DDD6FE] dark:border-[#271E4C] bg-[#F6F4FE] dark:bg-[#100C22] px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A81AC] dark:text-[#726A99]" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EDE9FE] dark:bg-[#161033] text-sm text-[#1C143B] dark:text-[#F3F0FF] pl-9 pr-4 py-2.5 rounded-xl border border-[#DDD6FE] dark:border-[#2E245B] focus:border-[#8B5CF6] focus:outline-none"
            />
          </form>

          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C143B] dark:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#1A143B]"
              >
                <item.icon className="w-4 h-4 text-[#584F7C] dark:text-[#A59ECA]" />
                {item.label}
              </Link>
            ))}
            <Link
              href="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C143B] dark:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#1A143B]"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Favorites</span>
              </div>
              <span className="text-xs bg-[#EDE9FE] dark:bg-[#1E1744] px-2 py-0.5 rounded-full font-semibold">
                {favorites.size}
              </span>
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSubmitModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-[#7C3AED] dark:text-[#22D3EE] hover:bg-[#EDE9FE] dark:hover:bg-[#1A143B] text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#8B5CF6] dark:text-[#22D3EE]" />
                <span>Submit a Prompt</span>
              </div>
              <span className="text-[10px] uppercase font-bold bg-[#EDE9FE] dark:bg-[#221644] px-2 py-0.5 rounded-full">
                New
              </span>
            </button>
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1C143B] dark:text-[#F3F0FF] hover:bg-[#EDE9FE] dark:hover:bg-[#1A143B]"
            >
              <Layers className="w-4 h-4 text-[#584F7C] dark:text-[#A59ECA]" />
              <span>Creator Studio</span>
            </Link>
          </nav>

          <div className="flex items-center justify-between pt-2 border-t border-[#DDD6FE] dark:border-[#271E4C]">
            <span className="text-xs text-[#584F7C] dark:text-[#A59ECA]">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#EDE9FE] dark:bg-[#161033] text-[#1C143B] dark:text-[#F3F0FF]"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsProModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white text-sm font-semibold shadow-md shadow-[#8B5CF6]/25"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isProUser ? "Pixora Pro Active" : "Upgrade to Pixora Pro"}</span>
          </button>
        </div>
      )}
    </header>
  );
}
