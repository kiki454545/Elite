-- Migration pour ajouter la colonne languages à la table profiles

-- Supprimer l'ancienne colonne preferred_lang si elle existe
ALTER TABLE profiles DROP COLUMN IF EXISTS preferred_lang;

-- Ajouter la nouvelle colonne languages (tableau de texte)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN profiles.languages IS 'Langues parlées par l''utilisateur (tableau de codes ISO 639-1)';

-- Créer un index GIN pour améliorer les performances des recherches sur le tableau
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON profiles USING GIN(languages);
