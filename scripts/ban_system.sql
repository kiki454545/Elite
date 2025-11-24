-- Système de bannissement d'utilisateurs
-- Ce script ajoute les colonnes nécessaires pour gérer les bannissements

-- Ajouter les colonnes de ban dans la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ban_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS banned_by UUID DEFAULT NULL;

-- Créer un index sur banned_until pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_banned_until
ON profiles(banned_until)
WHERE banned_until IS NOT NULL;

-- Ajouter des commentaires pour la documentation
COMMENT ON COLUMN profiles.banned_until IS 'Date et heure jusqu''à laquelle l''utilisateur est banni (NULL si pas banni ou banni définitivement)';
COMMENT ON COLUMN profiles.ban_reason IS 'Raison du bannissement';
COMMENT ON COLUMN profiles.banned_at IS 'Date et heure du bannissement';
COMMENT ON COLUMN profiles.banned_by IS 'ID de l''admin qui a appliqué le ban';

-- Vérification: afficher quelques exemples de profils avec leurs colonnes de ban
SELECT id, username, email, banned_until, ban_reason, banned_at
FROM profiles
LIMIT 5;
