-- Migration pour ajouter la colonne availability à la table profiles

-- Ajouter la nouvelle colonne availability (JSONB)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
  "monday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "tuesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "wednesday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "thursday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "friday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "saturday": {"enabled": false, "start": "09:00", "end": "17:00"},
  "sunday": {"enabled": false, "start": "09:00", "end": "17:00"}
}'::jsonb;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN profiles.availability IS 'Disponibilités hebdomadaires de l''utilisateur avec horaires pour chaque jour';

-- Créer un index GIN pour améliorer les performances des recherches sur le JSONB
CREATE INDEX IF NOT EXISTS idx_profiles_availability ON profiles USING GIN(availability);
