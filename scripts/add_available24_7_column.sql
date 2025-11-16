-- Migration pour ajouter la colonne available24_7 à la table profiles

-- Ajouter la nouvelle colonne available24_7 (BOOLEAN)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS available24_7 BOOLEAN DEFAULT false;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN profiles.available24_7 IS 'Indique si l''utilisateur est disponible 24h/24 et 7j/7';

-- Créer un index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS idx_profiles_available24_7 ON profiles(available24_7);
