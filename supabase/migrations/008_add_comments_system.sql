-- Table des commentaires sur les annonces
CREATE TABLE IF NOT EXISTS ad_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES ad_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ad_comments_ad_id ON ad_comments(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_user_id ON ad_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_parent_id ON ad_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_ad_comments_created_at ON ad_comments(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE ad_comments ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les commentaires non signalés
CREATE POLICY "Les commentaires sont visibles publiquement"
  ON ad_comments
  FOR SELECT
  USING (is_reported = FALSE OR auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM ads WHERE id = ad_id
  ));

-- Politique : Les utilisateurs authentifiés peuvent créer des commentaires
CREATE POLICY "Les utilisateurs authentifiés peuvent commenter"
  ON ad_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent modifier leurs propres commentaires
CREATE POLICY "Les utilisateurs peuvent modifier leurs commentaires"
  ON ad_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres commentaires
CREATE POLICY "Les utilisateurs peuvent supprimer leurs commentaires"
  ON ad_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fonction pour compter les commentaires d'une annonce
CREATE OR REPLACE FUNCTION count_ad_comments(ad_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM ad_comments
  WHERE ad_id = ad_uuid AND is_reported = FALSE AND parent_id IS NULL;
$$ LANGUAGE SQL STABLE;

-- Ajouter une colonne comments_count dans la table ads
ALTER TABLE ads ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Fonction pour mettre à jour le compteur de commentaires
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NULL THEN
    UPDATE ads
    SET comments_count = comments_count + 1
    WHERE id = NEW.ad_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NULL THEN
    UPDATE ads
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.ad_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le compteur
DROP TRIGGER IF EXISTS trigger_update_comments_count ON ad_comments;
CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON ad_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_count();
