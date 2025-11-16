-- Ajouter la colonne admin au profil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances des recherches admin
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Pour ajouter un admin manuellement, utiliser cette commande :
-- UPDATE profiles SET is_admin = TRUE WHERE id = 'USER_UUID_HERE';
