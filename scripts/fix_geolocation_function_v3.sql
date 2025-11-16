-- Fonction RPC corrigée pour rechercher des annonces par distance
-- Version 3 : simplifié sans spécifier les types explicites

DROP FUNCTION IF EXISTS search_ads_by_distance CASCADE;

CREATE OR REPLACE FUNCTION search_ads_by_distance(
  search_lat DECIMAL,
  search_lon DECIMAL,
  max_distance_km INTEGER DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  country TEXT,
  nearby_cities TEXT[],
  categories TEXT[],
  meeting_places TEXT[],
  price INTEGER,
  photos TEXT[],
  status TEXT,
  verified BOOLEAN,
  views INTEGER,
  favorites_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  contact_info JSONB,
  languages TEXT[],
  accepts_couples BOOLEAN,
  outcall BOOLEAN,
  incall BOOLEAN,
  physical_attributes JSONB,
  comments_count INTEGER,
  latitude NUMERIC,
  longitude NUMERIC,
  distance_km NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ads.id,
    ads.user_id,
    ads.title::TEXT,
    ads.description::TEXT,
    ads.location::TEXT,
    ads.country::TEXT,
    ads.nearby_cities,
    ads.categories,
    ads.meeting_places,
    ads.price,
    ads.photos,
    ads.status::TEXT,
    ads.verified,
    ads.views,
    ads.favorites_count,
    ads.created_at,
    ads.updated_at,
    ads.published_at,
    ads.contact_info,
    ads.languages,
    ads.accepts_couples,
    ads.outcall,
    ads.incall,
    ads.physical_attributes,
    ads.comments_count,
    ads.latitude,
    ads.longitude,
    calculate_distance(ads.latitude, ads.longitude, search_lat, search_lon) as distance_km
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
$$;

COMMENT ON FUNCTION search_ads_by_distance IS 'Recherche des annonces par distance depuis un point GPS donné';
