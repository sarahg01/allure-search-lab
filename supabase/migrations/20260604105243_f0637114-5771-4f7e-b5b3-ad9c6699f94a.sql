
-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LOOKS
CREATE TABLE public.looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX looks_user_id_idx ON public.looks(user_id);
CREATE INDEX looks_created_at_idx ON public.looks(created_at DESC);
GRANT SELECT ON public.looks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.looks TO authenticated;
GRANT ALL ON public.looks TO service_role;
ALTER TABLE public.looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public looks viewable by all" ON public.looks FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users insert own looks" ON public.looks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own looks" ON public.looks FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own looks" ON public.looks FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_looks_updated BEFORE UPDATE ON public.looks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI ANALYSIS
CREATE TABLE public.ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id UUID NOT NULL UNIQUE REFERENCES public.looks(id) ON DELETE CASCADE,
  skin_tone TEXT,
  skin_tone_confidence NUMERIC,
  undertone TEXT,
  undertone_confidence NUMERIC,
  lip_category TEXT,
  lip_color TEXT,
  lip_confidence NUMERIC,
  blush_category TEXT,
  blush_color TEXT,
  blush_confidence NUMERIC,
  eyeshadow_category TEXT,
  eyeshadow_color TEXT,
  eyeshadow_confidence NUMERIC,
  foundation_category TEXT,
  foundation_finish TEXT,
  foundation_confidence NUMERIC,
  style_tags TEXT[],
  raw_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_analysis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_analysis TO authenticated;
GRANT ALL ON public.ai_analysis TO service_role;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI analysis viewable with look" ON public.ai_analysis FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.looks l WHERE l.id = look_id AND (l.is_public OR l.user_id = auth.uid()))
);
CREATE POLICY "Service role manages analysis" ON public.ai_analysis FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.looks l WHERE l.id = look_id AND l.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.looks l WHERE l.id = look_id AND l.user_id = auth.uid())
);

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  shade TEXT,
  shade_family TEXT,
  finish TEXT,
  undertone TEXT,
  price_inr NUMERIC NOT NULL,
  image_url TEXT,
  retailer_url TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_price_idx ON public.products(price_inr);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON public.products FOR SELECT USING (true);

-- LOOK <-> PRODUCT matches
CREATE TABLE public.look_products (
  look_id UUID NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  match_confidence NUMERIC,
  reason TEXT,
  PRIMARY KEY (look_id, product_id)
);
GRANT SELECT ON public.look_products TO anon, authenticated;
GRANT ALL ON public.look_products TO service_role;
ALTER TABLE public.look_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Look products public read" ON public.look_products FOR SELECT USING (true);

-- LIKES
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  look_id UUID NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, look_id)
);
GRANT SELECT ON public.likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes public read" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users like" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unlike" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- SAVES
CREATE TABLE public.saves (
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  look_id UUID NOT NULL REFERENCES public.looks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, look_id)
);
GRANT SELECT ON public.saves TO anon;
GRANT SELECT, INSERT, DELETE ON public.saves TO authenticated;
GRANT ALL ON public.saves TO service_role;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saves public read" ON public.saves FOR SELECT USING (true);
CREATE POLICY "Users save" ON public.saves FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unsave" ON public.saves FOR DELETE TO authenticated USING (auth.uid() = user_id);
