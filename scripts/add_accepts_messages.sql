-- Migration pour ajouter la colonne accepts_messages à la table profiles

-- Ajouter la colonne accepts_messages (par défaut true)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS accepts_messages BOOLEAN DEFAULT true;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN profiles.accepts_messages IS 'Indique si l''utilisateur accepte de recevoir des messages privés sur le site';
