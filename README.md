# Pixora — AI Image Prompt Discovery Platform

> **"A curated creative library for AI creators."**  
> Discover prompts behind stunning AI images across Midjourney, Flux, Stable Diffusion, DALL-E, and Ideogram.

---

## 1. Product Vision & Architecture

**Pixora** is a modern, premium web platform where creators discover high-quality AI-generated visuals, explore distinct creative aesthetics, and unlock the exact prompts and generation parameters used to create them.

The platform blends:
- **Pinterest** — Visual masonry discovery
- **Dribbble** — Premium creative presentation
- **PromptBase** — Specialized prompt-focused marketplace mechanics
- **Unsplash** — Clean, distraction-free image browsing
- **Modern AI SaaS** — Polished, minimalist interface with neutral-first palette

### The Core User Loop
$$\text{Discover} \longrightarrow \text{Preview} \longrightarrow \text{Unlock} \longrightarrow \text{Copy} \longrightarrow \text{Create}$$

1. **Discover**: Browse curated, high-resolution AI visuals in a responsive masonry grid.
2. **Preview**: Inspect aspect ratios, model architectures, stylistic tags, and lighting setups.
3. **Unlock**: Watch a 5-second rewarded sponsor advertisement to decrypt the full prompt blueprint.
4. **Copy**: 1-click copy with or without parameters into your clipboard.
5. **Create**: Paste directly into Midjourney, Flux, Stable Diffusion, or DALL-E.

---

## 2. Security & Anti-Leak Architecture

### The Golden Rule
> **Locked prompt text is NEVER leaked in initial HTML or client-side responses.**

- **Public endpoints** (`/api/prompts`, `/api/prompts/[slug]`):
  All prompt listings and locked detail states omit `promptText` completely. The client payload receives only metadata (`title`, `slug`, `imageUrl`, `category`, `aiModel`, `aspectRatio`, `locked: true`).
- **Rewarded Ad Handshake**:
  1. Client calls `POST /api/prompts/[slug]/ad-start` $\to$ server initializes an authenticated `sessionId`.
  2. The interactive rewarded ad modal plays a 5-second countdown with sponsor branding (Runway Gen-3, Flux.1, Luma, Krea). Skipping is disabled during the countdown.
  3. Upon reaching 0s, client posts to `/api/prompts/[slug]/ad-complete`.
  4. Client calls `/api/prompts/[slug]/unlock` with `sessionId` and optional user token.
  5. The server validates the session completion timestamp, increments unlock counters, logs an analytics event, and securely returns the decrypted `promptText` and authorization token.
- **Persistence**:
  Unlocked prompts are cached per session in local storage, allowing returning visitors to view unlocked prompts without repeating ads.

---

## 3. Key Pages & Features

| Route | Feature Description |
|---|---|
| `/` | **Editorial Homepage**: Hero search bar, trending tags, horizontal category navigation, trending masonry gallery, "How Pixora Works" guide, and Pro plan teaser. |
| `/prompt/[slug]` | **Prompt Detail Page**: High-resolution image zoom, model badge, tags, locked container with 5s rewarded ad CTA, terminal-style Prompt Viewer with copy actions, and related prompts. |
| `/search` | **Search & Filters**: Multi-faceted filtering by Category, AI Model, Aesthetic Style, and Sort By (Trending, Most Unlocked, Most Saved, Newest). |
| `/category/[slug]` | **Curated Category Landing Pages**: `/category/fashion`, `/category/cinematic`, `/category/product`, `/category/portrait`, `/category/anime`, `/category/interior`, `/category/fantasy`, etc. |
| `/ai/[model]` | **Dedicated AI Model Guides**: `/ai/midjourney`, `/ai/flux`, `/ai/stable-diffusion`, `/ai/chatgpt-image`, `/ai/ideogram` with prompting tips and model parameters. |
| `/collections` | **Moodboards & Collections**: Create custom collections (e.g. *Cyberpunk Inspo*, *E-Commerce Ideas*), organize prompts, and save for production workflows. |
| `/favorites` | **Saved Favorites**: 1-click heart bookmarks with instant optimistic updates and persistent storage. |
| `/profile` | **Creator Dashboard**: Unlocks history, saved prompts, active collections, and Pixora Pro status toggle. |
| `/admin` | **Admin Control Center**: KPI stat cards (Total Prompts, Total Unlocks, Ad Completion %, Ad Revenue), Prompt Management CRUD (Create, Edit, Publish, Delete), Model Analytics, and Community Reports inbox. |
| `/sitemap.xml` | **Dynamic XML Sitemap**: Auto-generated for SEO search engine indexing. |
| `/robots.txt` | **Robots Directive**: Allowing public discovery while protecting admin and API routes. |

---

## 4. Design System & Palette

- **Near-Black**: `#111111`
- **Deep Charcoal**: `#1A1A1A`
- **Primary Background**: `#FAFAF9`
- **Secondary Surface**: `#F3F3F1`
- **Card Background**: `#FFFFFF`
- **Text Primary**: `#111111`
- **Text Secondary**: `#6B6B6B`
- **Text Muted**: `#999999`
- **Brand Accent**: `#6D5DFB` (Warm Violet) / `#4F6BFF` (Electric Blue)

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- npm or yarn

### Installation
```bash
# Navigate to project directory
cd pixora

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Connecting Supabase (Production Database & RLS)

Pixora includes an embedded state engine that works **100% out of the box** without external dependencies. When deploying to production with Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the complete SQL script in `supabase/schema.sql`.
4. Copy your project URL and Anon Key into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy to Vercel with one click:
   ```bash
   vercel deploy
   ```
