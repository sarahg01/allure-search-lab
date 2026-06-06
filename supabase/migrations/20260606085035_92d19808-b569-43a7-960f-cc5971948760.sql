
-- =========================================================
-- 1. Roles infrastructure
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================================================
-- 2. updated_at trigger helper (reuse existing if present)
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- 3. Extend products
-- =========================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS affiliate_url text;

-- Backfill affiliate_url from retailer_url when null
UPDATE public.products SET affiliate_url = retailer_url WHERE affiliate_url IS NULL;

-- Admin write policies on products
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- =========================================================
-- 4. Creators
-- =========================================================
CREATE TABLE IF NOT EXISTS public.creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  instagram_handle text,
  affiliate_code text UNIQUE,
  subscription_status text NOT NULL DEFAULT 'inactive',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.creators TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creators TO authenticated;
GRANT ALL ON public.creators TO service_role;

ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Creators public read" ON public.creators;
CREATE POLICY "Creators public read" ON public.creators FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators manage own" ON public.creators;
CREATE POLICY "Creators manage own" ON public.creators
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage creators" ON public.creators;
CREATE POLICY "Admins manage creators" ON public.creators
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_creators_updated ON public.creators;
CREATE TRIGGER trg_creators_updated BEFORE UPDATE ON public.creators
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 5. Stores
-- =========================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  store_name text NOT NULL,
  owner_name text,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  latitude numeric,
  longitude numeric,
  subscription_status text NOT NULL DEFAULT 'inactive',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stores public read" ON public.stores;
CREATE POLICY "Stores public read" ON public.stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Stores manage own" ON public.stores;
CREATE POLICY "Stores manage own" ON public.stores
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage stores" ON public.stores;
CREATE POLICY "Admins manage stores" ON public.stores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_stores_updated ON public.stores;
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 6. Store inventory
-- =========================================================
CREATE TABLE IF NOT EXISTS public.store_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  stock_quantity integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, product_id)
);

GRANT SELECT ON public.store_inventory TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_inventory TO authenticated;
GRANT ALL ON public.store_inventory TO service_role;

ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inventory public read" ON public.store_inventory;
CREATE POLICY "Inventory public read" ON public.store_inventory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Store owner manages inventory" ON public.store_inventory;
CREATE POLICY "Store owner manages inventory" ON public.store_inventory
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins manage inventory" ON public.store_inventory;
CREATE POLICY "Admins manage inventory" ON public.store_inventory
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_inventory_updated ON public.store_inventory;
CREATE TRIGGER trg_inventory_updated BEFORE UPDATE ON public.store_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
