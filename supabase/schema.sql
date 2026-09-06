-- ============================================================
-- HabitTracker — Supabase Schema with Row Level Security
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- HABITS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  category       TEXT NOT NULL DEFAULT 'Personal',
  frequency      TEXT NOT NULL DEFAULT 'daily',
  custom_days    INTEGER[] DEFAULT NULL,  -- 0=Sun,1=Mon,...,6=Sat
  target_value   NUMERIC,
  target_unit    TEXT,
  reminder_time  TIME,
  icon           TEXT DEFAULT '🎯',
  color          TEXT DEFAULT '#3B82F6',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own habits"
  ON public.habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON public.habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON public.habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON public.habits FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- HABIT COMPLETIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id         UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date  DATE NOT NULL,
  completed        BOOLEAN NOT NULL DEFAULT FALSE,
  progress_value   NUMERIC DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions"
  ON public.habit_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.habit_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own completions"
  ON public.habit_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.habit_completions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  description         TEXT,
  icon                TEXT DEFAULT '🏆',
  requirement_type    TEXT NOT NULL,  -- 'streak', 'completions', 'habits', 'perfect_week'
  requirement_value   INTEGER NOT NULL DEFAULT 1,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public read for achievements (everyone sees the same list)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements are publicly readable"
  ON public.achievements FOR SELECT
  USING (TRUE);

-- Seed achievements
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Step',      'Complete your very first habit',         '🌱', 'completions', 1),
  ('Getting Started', 'Complete 10 habits total',              '🚀', 'completions', 10),
  ('Century',         'Complete 100 habits total',             '💯', 'completions', 100),
  ('Dedicated',       'Complete 500 habits total',             '⭐', 'completions', 500),
  ('Week Warrior',    'Maintain a 7-day streak',               '🔥', 'streak',      7),
  ('Fortnight',       'Maintain a 14-day streak',              '🔥', 'streak',      14),
  ('Monthly Master',  'Maintain a 30-day streak',              '🔥', 'streak',      30),
  ('Iron Will',       'Maintain a 100-day streak',             '💎', 'streak',      100),
  ('Habit Builder',   'Create your first habit',               '🎯', 'habits',      1),
  ('Collector',       'Create 5 habits',                       '🎯', 'habits',      5),
  ('Perfect Week',    'Complete all habits every day for 7 days','🏆','perfect_week', 7)
ON CONFLICT DO NOTHING;

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT trigger helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- STORAGE: avatars bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
