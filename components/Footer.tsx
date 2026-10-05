"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function Footer() {
  const { setIsProModalOpen } = usePixora();

  return (
    <footer className="border-t border-[#DDD6FE]/70 dark:border-[#271E4C]/80 bg-[#ECE8FB] dark:bg-[#070510] text-[#1C143B] dark:text-[#F3F0FF] pt-16 pb-12 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-md shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
                P
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#7C3AED] to-[#0891B2] dark:from-[#A78BFA] dark:to-[#22D3EE] bg-clip-text text-transparent">
                PIXORA
              </span>
            </Link>
            <p className="text-sm text-[#584F7C] dark:text-[#A59ECA] max-w-sm leading-relaxed">
              A curated visual discovery engine and prompt library for AI image creators. Explore breathtaking visuals, unlock exact prompt blueprints, and bring your visions to life.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsProModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-[#8B5CF6]/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Try Pixora Pro (Ad-free)</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">Categories</h4>
            <ul className="space-y-2 text-sm text-[#584F7C] dark:text-[#A59ECA]">
              <li>
                <Link href="/category/fashion" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Fashion & Couture
                </Link>
              </li>
              <li>
                <Link href="/category/cinematic" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Cinematic Lighting
                </Link>
              </li>
              <li>
                <Link href="/category/product" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Product Commercials
                </Link>
              </li>
              <li>
                <Link href="/category/portrait" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Portraits & Analog
                </Link>
              </li>
              <li>
                <Link href="/category/anime" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Anime & Illustration
                </Link>
              </li>
              <li>
                <Link href="/category/interior" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Interior & Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Models */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">AI Models</h4>
            <ul className="space-y-2 text-sm text-[#584F7C] dark:text-[#A59ECA]">
              <li>
                <Link href="/ai/midjourney" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Midjourney v6
                </Link>
              </li>
              <li>
                <Link href="/ai/flux" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Flux.1 Schnell & Pro
                </Link>
              </li>
              <li>
                <Link href="/ai/stable-diffusion" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Stable Diffusion XL
                </Link>
              </li>
              <li>
                <Link href="/ai/chatgpt-image" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  ChatGPT / DALL-E 3
                </Link>
              </li>
              <li>
                <Link href="/ai/ideogram" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Ideogram 2.0
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">Platform</h4>
            <ul className="space-y-2 text-sm text-[#584F7C] dark:text-[#A59ECA]">
              <li>
                <Link href="/search" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Search & Filters
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  My Collections
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Saved Favorites
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
                  Unlock History
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#DDD6FE] dark:border-[#271E4C] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A81AC] dark:text-[#726A99]">
          <p>© {new Date().getFullYear()} Pixora Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-[#7C3AED] dark:hover:text-[#22D3EE] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
