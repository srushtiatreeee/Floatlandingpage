/*
  # Create profile pictures storage bucket

  1. Storage Bucket
    - Create `profile-pictures` bucket for storing user profile images
    - Set up public access for profile pictures
    - Configure RLS policies for secure access

  2. Security
    - Users can upload their own profile pictures
    - Users can view any profile picture (public access)
    - Users can update/delete only their own profile pictures
*/

-- Create the profile-pictures bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-pictures',
  'profile-pictures',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view profile pictures (public access)
CREATE POLICY "Profile pictures are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Policy: Users can update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);