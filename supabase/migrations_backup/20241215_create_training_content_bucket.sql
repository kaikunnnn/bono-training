
-- Create training-content bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'training-content') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('training-content', 'training-content', false);
    END IF;
END $$;

-- Enable RLS on storage.objects if not already enabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; -- Commented out: RLS is already enabled by default

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read training content" ON storage.objects;
DROP POLICY IF EXISTS "Allow free content for all authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow premium content for subscribed users" ON storage.objects;
DROP POLICY IF EXISTS "anon_read_free" ON storage.objects;
DROP POLICY IF EXISTS "authed_read_all" ON storage.objects;

-- Create RLS policies for training-content bucket
-- Policy 1: Authenticated users can read all training content
CREATE POLICY "authenticated_users_read_training_content"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'training-content');

-- Policy 2: Anonymous users can read free content only
CREATE POLICY "anonymous_users_read_free_content"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'training-content' 
  AND (metadata->>'is_free')::boolean = true
);

-- Policy 3: Service role can manage all content (for sync scripts)
CREATE POLICY "service_role_manage_training_content"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'training-content');
