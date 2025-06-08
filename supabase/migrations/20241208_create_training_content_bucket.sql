
-- Create training-content bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('training-content', 'training-content', false);

-- Create RLS policies for training-content bucket
CREATE POLICY "Allow authenticated users to read training content" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'training-content' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow free content for all authenticated users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'training-content' 
  AND auth.uid() IS NOT NULL 
  AND (metadata->>'is_free')::boolean = true
);

CREATE POLICY "Allow premium content for subscribed users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'training-content' 
  AND auth.uid() IS NOT NULL 
  AND (
    (metadata->>'is_free')::boolean = true 
    OR EXISTS (
      SELECT 1 FROM public.user_subscriptions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND plan_type IN ('standard', 'growth', 'community')
    )
  )
);
