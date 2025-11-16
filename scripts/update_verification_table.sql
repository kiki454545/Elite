-- Modifier la table verification_requests pour utiliser un array de photos
ALTER TABLE verification_requests
  DROP COLUMN IF EXISTS id_document_url,
  DROP COLUMN IF EXISTS selfie_url;

ALTER TABLE verification_requests
  ADD COLUMN IF NOT EXISTS verification_photos TEXT[] NOT NULL DEFAULT '{}';
