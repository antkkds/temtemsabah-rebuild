-- ============================================
-- TemTemSabah Admin — Supabase Schema
-- Paste this in: SQL Editor → New Query → Run
-- ============================================

-- Newsroom articles
CREATE TABLE IF NOT EXISTS newsroom (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT DEFAULT '',
  full_content TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  category TEXT DEFAULT 'External News',
  content_type TEXT DEFAULT 'external',
  external_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  publish_date TEXT DEFAULT '',
  author TEXT DEFAULT 'Tem Tem Sabah',
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  type TEXT DEFAULT '',
  cuisine TEXT DEFAULT '',
  prep TEXT DEFAULT '',
  cook TEXT DEFAULT '',
  servings INTEGER DEFAULT 4,
  cost TEXT DEFAULT '',
  description TEXT DEFAULT '',
  ingredients JSONB DEFAULT '[]',
  instructions JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  tips TEXT DEFAULT '',
  video TEXT DEFAULT '',
  nutrition JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site content
CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  message TEXT DEFAULT '',
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (safe defaults)
ALTER TABLE newsroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow anon key to read/write all tables (admin access)
CREATE POLICY "Allow all on newsroom" ON newsroom FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on recipes" ON recipes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on content" ON content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);

-- Enable auto-update for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsroom_updated_at BEFORE UPDATE ON newsroom
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
