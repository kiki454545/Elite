-- ==========================================
-- Migration pour le tracking IP des vues
-- ==========================================

-- 1. Créer la table ad_views pour tracker les vues par IP
CREATE TABLE IF NOT EXISTS ad_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL, -- Supporte IPv4 et IPv6
  view_count INTEGER DEFAULT 1,
  last_view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_id, ip_address, last_view_date)
);

-- 2. Ajouter un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ad_views_ad_ip_date
ON ad_views(ad_id, ip_address, last_view_date);

-- 3. Ajouter la colonne last_ip dans profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_ip VARCHAR(45);

-- 4. Ajouter un index sur last_ip
CREATE INDEX IF NOT EXISTS idx_profiles_last_ip
ON profiles(last_ip);

-- 5. Activer RLS sur ad_views
ALTER TABLE ad_views ENABLE ROW LEVEL SECURITY;

-- 6. Politique RLS : Tout le monde peut lire les vues (pour les stats)
CREATE POLICY "Tout le monde peut lire les vues"
ON ad_views
FOR SELECT
TO public
USING (true);

-- 7. Politique RLS : Seul le service peut insérer/mettre à jour (via API)
CREATE POLICY "Service peut gérer les vues"
ON ad_views
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Créer une fonction pour nettoyer les anciennes vues (optionnel, pour optimisation)
CREATE OR REPLACE FUNCTION cleanup_old_ad_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les vues de plus de 30 jours
  DELETE FROM ad_views
  WHERE last_view_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$;

-- 9. Commentaires pour documentation
COMMENT ON TABLE ad_views IS 'Table pour tracker les vues d''annonces par adresse IP';
COMMENT ON COLUMN ad_views.ip_address IS 'Adresse IP du visiteur (IPv4 ou IPv6)';
COMMENT ON COLUMN ad_views.view_count IS 'Nombre de vues pour cette IP aujourd''hui (max 5)';
COMMENT ON COLUMN ad_views.last_view_date IS 'Date de la dernière vue';
COMMENT ON COLUMN profiles.last_ip IS 'Dernière adresse IP utilisée par l''utilisateur';
