"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { usePixora } from "@/lib/context/PixoraContext";

export function Footer() {
  const { setIsProModalOpen } = usePixora();

  return (
    <footer className="border-t border-[#E8E8E5] bg-[#FAFAF9] text-[#111111] pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-lg tracking-wider">
                P
              </div>
              <span className="font-bold text-xl tracking-tight text-[#111111]">PIXORA</span>
            </Link>
            <p className="text-sm text-[#6B6B6B] max-w-sm leading-relaxed">
              A curated visual discovery engine and prompt library for AI image creators. Explore breathtaking visuals, unlock exact prompt blueprints, and bring your visions to life.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsProModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-[#2A2A2A] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Pixora Pro (Ad-free)</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Categories</h4>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li>
                <Link href="/category/fashion" className="hover:text-[#111111] transition-colors">
                  Fashion & Couture
                </Link>
              </li>
              <li>
                <Link href="/category/cinematic" className="hover:text-[#111111] transition-colors">
                  Cinematic Lighting
                </Link>
              </li>
              <li>
                <Link href="/category/product" className="hover:text-[#111111] transition-colors">
                  Product Commercials
                </Link>
              </li>
              <li>
                <Link href="/category/portrait" className="hover:text-[#111111] transition-colors">
                  Portraits & Analog
                </Link>
              </li>
              <li>
                <Link href="/category/anime" className="hover:text-[#111111] transition-colors">
                  Anime & Illustration
                </Link>
              </li>
              <li>
                <Link href="/category/interior" className="hover:text-[#111111] transition-colors">
                  Interior & Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Models */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">AI Models</h4>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li>
                <Link href="/ai/midjourney" className="hover:text-[#111111] transition-colors">
                  Midjourney v6
                </Link>
              </li>
              <li>
                <Link href="/ai/flux" className="hover:text-[#111111] transition-colors">
                  Flux.1 Schnell & Pro
                </Link>
              </li>
              <li>
                <Link href="/ai/stable-diffusion" className="hover:text-[#111111] transition-colors">
                  Stable Diffusion XL
                </Link>
              </li>
              <li>
                <Link href="/ai/chatgpt-image" className="hover:text-[#111111] transition-colors">
                  ChatGPT / DALL-E 3
                </Link>
              </li>
              <li>
                <Link href="/ai/ideogram" className="hover:text-[#111111] transition-colors">
                  Ideogram 2.0
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Platform</h4>
            <ul className="space-y-2 text-sm text-[#6B6B6B]">
              <li>
                <Link href="/search" className="hover:text-[#111111] transition-colors">
                  Search & Filters
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-[#111111] transition-colors">
                  My Collections
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-[#111111] transition-colors">
                  Saved Favorites
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#111111] transition-colors">
                  Unlock History
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E8E8E5] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#999999]">
          <p>© {new Date().getFullYear()} Pixora Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-[#111111] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
