-- ==========================================================
-- PIXORA — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Target: Supabase PostgreSQL
-- ==========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROMPTS
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  prompt_text TEXT NOT NULL, -- CRITICAL: protected by RLS
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  ai_model TEXT NOT NULL, -- 'Midjourney', 'Flux', 'Stable Diffusion', etc.
  style TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '1:1',
  parameters JSONB DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  unlock_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TAGS & PROMPT_TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.prompt_tags (
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

-- 5. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, prompt_id)
);

-- 6. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.collection_prompts (
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (collection_id, prompt_id)
);

-- 7. AD UNLOCK SESSIONS & VERIFICATION
CREATE TABLE IF NOT EXISTS public.ad_unlock_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sponsor_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  duration_sec INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 8. PROMPT UNLOCKS
CREATE TABLE IF NOT EXISTS public.prompt_unlocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_token TEXT,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  unlock_method TEXT DEFAULT 'rewarded_ad', -- 'rewarded_ad' or 'pro_subscription'
  unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  prompt_title TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  user_email TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'view', 'unlock_attempt', 'unlock_success', 'copy', 'favorite', 'share'
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public view for prompts (stripping prompt_text via Postgres View or Column Grants)
CREATE OR REPLACE VIEW public.public_prompts AS
SELECT
  id,
  title,
  slug,
  description,
  image_url,
  thumbnail_url,
  category_id,
  ai_model,
  style,
  aspect_ratio,
  parameters,
  is_featured,
  is_trending,
  is_published,
  unlock_count,
  view_count,
  favorite_count,
  created_at
FROM public.prompts
WHERE is_published = true;

-- Secure function to retrieve prompt text only after unlock check
CREATE OR REPLACE FUNCTION public.get_unlocked_prompt_text(target_prompt_id UUID, user_session_token TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prompt_text TEXT;
  v_is_unlocked BOOLEAN;
BEGIN
  -- Check if session exists in prompt_unlocks
  SELECT EXISTS(
    SELECT 1 FROM public.prompt_unlocks
    WHERE prompt_id = target_prompt_id AND (session_token = user_session_token OR user_id = auth.uid())
  ) INTO v_is_unlocked;

  IF NOT v_is_unlocked THEN
    RAISE EXCEPTION 'Prompt is locked. Please complete rewarded ad session.';
  END IF;

  SELECT prompt_text INTO v_prompt_text FROM public.prompts WHERE id = target_prompt_id;
  RETURN v_prompt_text;
END;
$$;
