-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir tous les profils" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles;

-- Activer RLS sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut lire les profils (pour voir les annonces)
CREATE POLICY "Les utilisateurs peuvent voir tous les profils"
ON profiles
FOR SELECT
TO authenticated, anon
USING (true);

-- Politique: Les utilisateurs authentifiés peuvent créer leur propre profil
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Politique: Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Politique spéciale: Permettre l'insertion pendant l'inscription (anon)
-- Cette politique permet au signup de créer le profil immédiatement après la création du compte
CREATE POLICY "Permettre l'insertion lors de l'inscription"
ON profiles
FOR INSERT
TO anon
WITH CHECK (true);
