
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies on the 'looks' bucket
CREATE POLICY "Look images public read" ON storage.objects FOR SELECT USING (bucket_id = 'looks');
CREATE POLICY "Users upload own look images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'looks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own look images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'looks' AND auth.uid()::text = (storage.foldername(name))[1]);
