import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PixoraProvider } from "@/lib/context/PixoraContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShareModal } from "@/components/ShareModal";
import { ReportModal } from "@/components/ReportModal";
import { ProModal } from "@/components/ProModal";
import { ToastContainer } from "@/components/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixora — Curated AI Image Prompt Discovery Platform",
  description:
    "Discover prompts behind stunning AI images. Explore curated AI-generated visuals and unlock the exact prompts used to create them across Midjourney, Flux, Stable Diffusion, and DALL-E.",
  keywords: [
    "AI Prompts",
    "Midjourney Prompts",
    "Flux Prompts",
    "Stable Diffusion",
    "Prompt Engineering",
    "AI Image Generator",
    "DALL-E 3",
  ],
  openGraph: {
    title: "Pixora — Curated AI Image Prompt Discovery",
    description: "Explore curated AI visuals and unlock the exact prompts behind them.",
    url: "https://pixora.ai",
    siteName: "Pixora",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAF9] text-[#111111] selection:bg-[#6D5DFB] selection:text-white">
        <PixoraProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />

          {/* Global Modal Layer */}
          <ShareModal />
          <ReportModal />
          <ProModal />
          <ToastContainer />
        </PixoraProvider>
      </body>
    </html>
  );
}
