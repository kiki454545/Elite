-- PARTIE 2 : Index et RLS

-- Créer les index pour améliorer les performances
CREATE INDEX ads_user_id_idx ON public.ads(user_id);
CREATE INDEX ads_location_idx ON public.ads(location);
CREATE INDEX ads_status_idx ON public.ads(status);
CREATE INDEX ads_created_at_idx ON public.ads(created_at DESC);
CREATE INDEX ads_categories_idx ON public.ads USING GIN(categories);
CREATE INDEX favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX favorites_ad_id_idx ON public.favorites(ad_id);

-- Activer RLS (Row Level Security)
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité pour ads
CREATE POLICY "Annonces approuvées visibles par tous"
  ON public.ads FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs annonces"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs annonces"
  ON public.ads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs annonces"
  ON public.ads FOR DELETE
  USING (auth.uid() = user_id);

-- Créer les politiques pour les favoris
CREATE POLICY "Utilisateurs peuvent voir leurs favoris"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent ajouter des favoris"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent retirer des favoris"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Créer la fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
