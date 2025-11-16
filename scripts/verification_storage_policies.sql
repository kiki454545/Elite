-- Policies pour le bucket verification-photos

-- Supprimer les policies existantes si elles existent
DROP POLICY IF EXISTS "Users can upload verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete verification photos" ON storage.objects;

-- Permettre aux utilisateurs authentifiés d'uploader des photos
CREATE POLICY "Users can upload verification photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-photos');

-- Permettre à tout le monde de lire les photos (pour que les admins puissent les voir)
CREATE POLICY "Anyone can view verification photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'verification-photos');

-- Permettre aux admins de supprimer les photos
CREATE POLICY "Admins can delete verification photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-photos'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = TRUE
  )
);
