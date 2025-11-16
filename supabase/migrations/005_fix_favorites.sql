-- ==========================================
-- FIX FAVORIS - Migration complète
-- ==========================================

-- 1. Recréer les fonctions RPC au cas où elles n'existent pas
CREATE OR REPLACE FUNCTION increment_favorites(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET favorites = COALESCE(favorites, 0) + 1
  WHERE id = ad_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_favorites(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET favorites = GREATEST(COALESCE(favorites, 0) - 1, 0)
  WHERE id = ad_id;
END;
$$;

-- 2. Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_favorites(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_favorites(UUID) TO authenticated, anon;

-- 3. S'assurer que RLS est actif sur la table favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 4. Recréer les politiques RLS pour les favoris
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs favoris" ON favorites;
DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des favoris" ON favorites;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs favoris" ON favorites;

-- Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Les utilisateurs peuvent voir leurs favoris"
ON favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Les utilisateurs peuvent ajouter des favoris"
ON favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Les utilisateurs peuvent supprimer leurs favoris"
ON favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
