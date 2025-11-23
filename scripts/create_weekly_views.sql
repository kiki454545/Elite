-- Ajouter une colonne pour compter les vues hebdomadaires
ALTER TABLE ads ADD COLUMN IF NOT EXISTS weekly_views INTEGER DEFAULT 0;

-- Créer une table pour tracker la dernière réinitialisation
CREATE TABLE IF NOT EXISTS weekly_reset_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ads_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ads_weekly_views ON ads(weekly_views DESC);

-- Fonction pour réinitialiser les compteurs hebdomadaires (à appeler tous les lundis)
CREATE OR REPLACE FUNCTION reset_weekly_views()
RETURNS void AS $$
DECLARE
  ads_updated INTEGER;
BEGIN
  -- Compter le nombre d'annonces
  SELECT COUNT(*) INTO ads_updated FROM ads WHERE status = 'approved';

  -- Réinitialiser tous les compteurs hebdomadaires
  UPDATE ads SET weekly_views = 0;

  -- Logger la réinitialisation
  INSERT INTO weekly_reset_log (reset_date, ads_count)
  VALUES (NOW(), ads_updated);

  RAISE NOTICE 'Weekly views reset completed for % ads', ads_updated;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction Edge pour appeler reset_weekly_views via HTTP
-- Cette fonction peut être appelée par un cron job externe ou Vercel Cron
