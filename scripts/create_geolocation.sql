-- Migration pour ajouter la géolocalisation aux annonces

-- Ajouter les colonnes GPS aux annonces
ALTER TABLE ads
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Index pour optimiser les recherches géographiques
CREATE INDEX IF NOT EXISTS idx_ads_location_coords ON ads(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ads_location_city ON ads(location, latitude, longitude);

-- Fonction pour calculer la distance entre deux points (formule Haversine)
-- Retourne la distance en kilomètres
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  -- Protection contre les valeurs invalides qui pourraient causer des erreurs dans acos
  RETURN (
    6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(lat1)) *
        cos(radians(lat2)) *
        cos(radians(lon2) - radians(lon1)) +
        sin(radians(lat1)) *
        sin(radians(lat2))
      ))
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Table des villes françaises avec coordonnées GPS
CREATE TABLE IF NOT EXISTS french_cities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL, -- Version normalisée pour la recherche (sans accents, minuscules)
  department TEXT,
  department_code TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches de villes
CREATE INDEX IF NOT EXISTS idx_french_cities_name ON french_cities(name);
CREATE INDEX IF NOT EXISTS idx_french_cities_name_normalized ON french_cities(name_normalized);
CREATE INDEX IF NOT EXISTS idx_french_cities_department ON french_cities(department_code);
CREATE INDEX IF NOT EXISTS idx_french_cities_location ON french_cities(latitude, longitude);

-- Fonction RPC pour rechercher des annonces par distance
CREATE OR REPLACE FUNCTION search_ads_by_distance(
  search_lat DECIMAL,
  search_lon DECIMAL,
  max_distance_km INTEGER DEFAULT NULL,
  gender_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  gender TEXT,
  age INTEGER,
  photos TEXT[],
  category TEXT,
  phone TEXT,
  whatsapp TEXT,
  status TEXT,
  views INTEGER,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ads.id,
    ads.user_id,
    ads.title,
    ads.description,
    ads.location,
    ads.gender,
    ads.age,
    ads.photos,
    ads.category,
    ads.phone,
    ads.whatsapp,
    ads.status,
    ads.views,
    ads.latitude,
    ads.longitude,
    calculate_distance(ads.latitude, ads.longitude, search_lat, search_lon) as distance_km,
    ads.created_at
  FROM ads
  WHERE
    ads.status = 'active'
    AND ads.latitude IS NOT NULL
    AND ads.longitude IS NOT NULL
    AND (gender_filter IS NULL OR ads.gender = gender_filter)
    AND (
      max_distance_km IS NULL
      OR calculate_distance(ads.latitude, ads.longitude, search_lat, search_lon) <= max_distance_km
    )
  ORDER BY distance_km ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Commenter les tables et colonnes
COMMENT ON COLUMN ads.latitude IS 'Latitude GPS de l''annonce (degrés)';
COMMENT ON COLUMN ads.longitude IS 'Longitude GPS de l''annonce (degrés)';
COMMENT ON TABLE french_cities IS 'Table des villes françaises avec coordonnées GPS pour la géolocalisation';
COMMENT ON FUNCTION calculate_distance IS 'Calcule la distance en km entre deux points GPS (formule Haversine)';
COMMENT ON FUNCTION search_ads_by_distance IS 'Recherche des annonces par distance depuis un point GPS donné';
