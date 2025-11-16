-- Fonction pour incrémenter le compteur de favoris d'une annonce
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

-- Fonction pour décrémenter le compteur de favoris d'une annonce
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

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION increment_favorites(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION decrement_favorites(UUID) TO authenticated, anon;
