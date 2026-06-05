
-- Tighten likes SELECT to owner
DROP POLICY IF EXISTS "Likes public read" ON public.likes;
CREATE POLICY "Users read own likes" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Tighten saves SELECT to owner
DROP POLICY IF EXISTS "Saves public read" ON public.saves;
CREATE POLICY "Users read own saves" ON public.saves FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Restrict look_products SELECT to public looks or owner
DROP POLICY IF EXISTS "Look products public read" ON public.look_products;
CREATE POLICY "Look products viewable with look" ON public.look_products FOR SELECT TO public
USING (EXISTS (SELECT 1 FROM public.looks l WHERE l.id = look_products.look_id AND (l.is_public OR l.user_id = auth.uid())));

-- Restrict storage SELECT on looks bucket to owner or public looks
DROP POLICY IF EXISTS "Look images public read" ON storage.objects;
CREATE POLICY "Look images viewable when public or owned" ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'looks' AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM public.looks l WHERE l.storage_path = storage.objects.name AND l.is_public)
  )
);
