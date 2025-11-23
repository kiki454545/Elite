-- Créer la table cities pour toutes les villes du monde
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  department TEXT,
  department_code TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name_normalized, country)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);
CREATE INDEX IF NOT EXISTS idx_cities_name_normalized ON cities(name_normalized);
CREATE INDEX IF NOT EXISTS idx_cities_name_country ON cities(name_normalized, country);

-- Activer RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Policy pour lecture publique
CREATE POLICY "Allow public read access" ON cities FOR SELECT USING (true);
