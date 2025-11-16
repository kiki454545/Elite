-- ==========================================
-- FIX FAVORIS - Corriger le nom de la colonne
-- ==========================================

-- Les fonctions utilisaient 'favorites' mais la colonne s'appelle 'favorites_count'

-- 1. Recréer la fonction increment_favorites avec le bon nom de colonne
CREATE OR REPLACE FUNCTION increment_favorites(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET favorites_count = COALESCE(favorites_count, 0) + 1
  WHERE id = ad_id;
END;
$$;

-- 2. Recréer la fonction decrement_favorites avec le bon nom de colonne
CREATE OR REPLACE FUNCTION decrement_favorites(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET favorites_count = GREATEST(COALESCE(favorites_count, 0) - 1, 0)
  WHERE id = ad_id;
END;
$$;

-- 3. Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_favorites(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_favorites(UUID) TO authenticated, anon;
