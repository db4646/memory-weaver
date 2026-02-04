-- Add file_url column to research_papers table
ALTER TABLE public.research_papers 
ADD COLUMN file_url TEXT NULL,
ADD COLUMN file_type TEXT NULL;

-- Create storage bucket for paper files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'paper-files', 
  'paper-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage policies for paper-files bucket
CREATE POLICY "Users can upload their own paper files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'paper-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own paper files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'paper-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own paper files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'paper-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view paper files"
ON storage.objects FOR SELECT
USING (bucket_id = 'paper-files');