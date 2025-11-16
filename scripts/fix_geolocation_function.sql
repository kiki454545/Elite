-- Fonction RPC corrigée pour rechercher des annonces par distance
-- Cette version utilise uniquement les colonnes qui existent dans la table ads

DROP FUNCTION IF EXISTS search_ads_by_distance;

CREATE OR REPLACE FUNCTION search_ads_by_distance(
  search_lat DECIMAL,
  search_lon DECIMAL,
  max_distance_km INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  title TEXT,
  description TEXT,
  age INTEGER,
  location TEXT,
  country TEXT,
  category TEXT,
  photos TEXT[],
  video TEXT,
  price INTEGER,
  services TEXT[],
  availability TEXT,
  verified BOOLEAN,
  rank TEXT,
  online BOOLEAN,
  views INTEGER,
  favorites INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ads.id,
    ads.user_id,
    ads.username,
    ads.title,
    ads.description,
    ads.age,
    ads.location,
    ads.country,
    ads.category,
    ads.photos,
    ads.video,
    ads.price,
    ads.services,
    ads.availability,
    ads.verified,
    ads.rank,
    ads.online,
    ads.views,
    ads.favorites,
    ads.latitude,
    ads.longitude,
    calculate_distance(ads.latitude, ads.longitude, search_lat, search_lon) as distance_km,
    ads.created_at,
    ads.updated_at
  FROM ads
  WHERE
    ads.status = 'approved'
    AND ads.latitude IS NOT NULL
    AND ads.longitude IS NOT NULL
    AND (
      max_distance_km IS NULL
      OR calculate_distance(ads.latitude, ads.longitude, search_lat, search_lon) <= max_distance_km
    )
  ORDER BY distance_km ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_ads_by_distance IS 'Recherche des annonces par distance depuis un point GPS donné (version corrigée)';
